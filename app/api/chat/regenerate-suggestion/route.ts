import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/gemini'
import { buildRegenerateSuggestionPrompt } from '@/lib/gemini/prompts'
import type { DivinationContext, ChatHistory } from '@/lib/gemini/types'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { cleanupMessageText } from '@/lib/utils/text-cleanup'

/**
 * 提案再生成API
 *
 * POST /api/chat/regenerate-suggestion
 *
 * ユーザーがメッセージを送信した後、そのメッセージを踏まえて
 * 新しい相談提案を自動生成します
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディを取得
    const body = await request.json()
    const { fortuneTellerId, latestMessageContent } = body

    if (!fortuneTellerId) {
      return NextResponse.json(
        { success: false, message: '占い師IDが必要です' },
        { status: 400 }
      )
    }

    if (!latestMessageContent) {
      return NextResponse.json(
        { success: false, message: 'メッセージ内容が必要です' },
        { status: 400 }
      )
    }

    // 占い師情報を取得
    const { data: fortuneTeller, error: fortuneTellerError } = await supabase
      .from('fortune_tellers')
      .select('*')
      .eq('id', fortuneTellerId)
      .eq('is_active', true)
      .single()

    if (fortuneTellerError || !fortuneTeller) {
      return NextResponse.json(
        { success: false, message: '占い師が見つかりません' },
        { status: 404 }
      )
    }

    // ユーザープロフィールを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, message: 'プロフィール情報が見つかりません' },
        { status: 404 }
      )
    }

    // チャット履歴を取得（最新のメッセージは除く）
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: true })
      .limit(20) // 最新20件まで

    if (messagesError) {
      console.error('チャット履歴取得エラー:', messagesError)
      return NextResponse.json(
        { success: false, message: 'チャット履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    // チャット履歴をChatHistory形式に変換（最新のメッセージは除外）
    const chatHistory: ChatHistory[] = messages
      .filter((msg) => msg.content !== latestMessageContent) // 今送信したメッセージを除く
      .slice(-10) // 最新10件まで
      .map((msg) => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))

    // 過去の鑑定結果を取得（開封済みのもののみ）
    const { data: previousDivinations, error: divinationError } = await supabase
      .from('divination_results')
      .select('result_encrypted')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .eq('is_unlocked', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (divinationError) {
      console.error('過去の鑑定結果取得エラー:', divinationError)
      // 過去の鑑定が取得できなくてもエラーにしない
    }

    const previousDivinationTexts = previousDivinations
      ? previousDivinations.map((d) => d.result_encrypted)
      : []

    // ユーザーの年齢を計算
    const userAge = calculateAge(profile.birth_date)

    // 現在の日本時間を取得
    const currentJapanTime = getCurrentJapanTime()

    // DivinationContextを構築
    const context: DivinationContext = {
      userNickname: profile.nickname,
      birthDate: profile.birth_date,
      userAge,
      gender: profile.gender,
      concernCategory: profile.concern_category,
      concernDescription: profile.concern_description,
      birthTime: profile.birth_time || undefined,
      birthPlace: profile.birth_place || undefined,
      partnerName: profile.partner_name || undefined,
      partnerGender: profile.partner_gender || undefined,
      partnerBirthDate: profile.partner_birth_date || undefined,
      partnerAge: profile.partner_age || undefined,
      chatHistory: chatHistory,
      previousDivinations: previousDivinationTexts.length > 0 ? previousDivinationTexts : undefined,
      currentJapanTime,
    }

    // 提案再生成プロンプトを構築
    const prompt = buildRegenerateSuggestionPrompt(
      fortuneTeller.suggestion_prompt,
      context,
      latestMessageContent,
      false // ユーザーメッセージからの再生成
    )

    console.log(
      '提案再生成プロンプトを構築:',
      prompt.substring(0, 200) + '...'
    )

    // Gemini APIで提案文を生成
    const rawSuggestion = await generateContent(prompt)

    // 生成された提案文から不要な文字列を削除
    const suggestion = cleanupMessageText(rawSuggestion)

    console.log('提案再生成完了:', suggestion)

    return NextResponse.json({
      success: true,
      data: {
        greeting: suggestion,
      },
    })
  } catch (error: any) {
    console.error('提案再生成エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: '提案の再生成に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
