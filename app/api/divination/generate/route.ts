import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateFullDivination } from '@/lib/gemini/client'
import { buildFullDivinationPrompt } from '@/lib/gemini/prompts'
import type { DivinationContext, ChatHistory } from '@/lib/gemini/types'
import type { GenerateDivinationResponse } from '@/lib/types/divination'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { cleanupDivinationMessages } from '@/lib/utils/text-cleanup'

// 重複防止用のロック期間（秒）
const DUPLICATE_PREVENTION_SECONDS = 60

/**
 * 鑑定生成API
 *
 * POST /api/divination/generate
 *
 * AI占い師による本格的な鑑定を生成し、データベースに保存します
 * 鑑定結果は3つのメッセージ（鑑定前、鑑定結果、鑑定後）で構成されます
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
    const { fortuneTellerId, requestId } = body

    if (!fortuneTellerId) {
      return NextResponse.json(
        { success: false, message: '占い師IDが必要です' },
        { status: 400 }
      )
    }

    // 重複防止: 直近の鑑定をチェック
    const adminSupabaseForCheck = createAdminClient()
    const cutoffTime = new Date(Date.now() - DUPLICATE_PREVENTION_SECONDS * 1000).toISOString()

    const { data: recentDivination, error: recentError } = await adminSupabaseForCheck
      .from('divination_results')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentDivination) {
      console.log('重複リクエストを検出:', {
        userId: user.id,
        fortuneTellerId,
        recentDivinationId: recentDivination.id,
        createdAt: recentDivination.created_at,
      })

      // 既存の鑑定が見つかった場合は、その情報を返す（重複処理を防止）
      return NextResponse.json({
        success: true,
        message: '既に鑑定が進行中または完了しています',
        data: {
          divination: {
            id: recentDivination.id,
            isDuplicate: true,
          },
        },
      })
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

    // チャット履歴を取得（最新10件）
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('sender_type, content, created_at')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (chatError) {
      console.error('チャット履歴取得エラー:', chatError)
      return NextResponse.json(
        { success: false, message: 'チャット履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    // チャット履歴を古い順に並び替え（時系列順）
    const chatHistory: ChatHistory[] = (chatMessages || [])
      .reverse()
      .map((msg) => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))

    // 過去の鑑定結果を取得（最新3件、開封済みのもののみ）
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
      chatHistory,
      previousDivinations: previousDivinationTexts.length > 0 ? previousDivinationTexts : undefined,
      currentJapanTime,
    }

    // 鑑定プロンプトを構築
    const prompt = buildFullDivinationPrompt(
      fortuneTeller.divination_prompt,
      fortuneTeller.name,
      context
    )

    console.log('鑑定プロンプトを構築:', prompt.substring(0, 200) + '...')

    // Gemini APIで鑑定を生成
    const rawDivination = await generateFullDivination(prompt)

    // 生成された鑑定結果から不要な文字列を削除
    const divination = cleanupDivinationMessages(rawDivination)

    console.log('鑑定を生成しました:', {
      greeting: divination.greetingMessage.substring(0, 50),
      resultLength: divination.resultMessage.length,
      after: divination.afterMessage.substring(0, 50),
    })

    // 鑑定結果の最初の20文字をプレビューとして取得
    const resultPreview = divination.resultMessage.substring(0, 20)

    // 占い師のメッセージをINSERTするためにAdmin Clientを使用
    const adminSupabase = createAdminClient()

    // 1. 鑑定前メッセージを保存
    const { error: greetingError } = await adminSupabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'fortune_teller',
        content: divination.greetingMessage,
        is_divination_request: false,
      })

    if (greetingError) {
      console.error('鑑定前メッセージ保存エラー:', greetingError)
      return NextResponse.json(
        { success: false, message: '鑑定前メッセージの保存に失敗しました' },
        { status: 500 }
      )
    }

    console.log('鑑定前メッセージを送信しました')

    // 10秒待機
    await new Promise(resolve => setTimeout(resolve, 10000))

    // 2. 鑑定結果を保存
    const { data: savedDivination, error: insertError } = await adminSupabase
      .from('divination_results')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        greeting_message: divination.greetingMessage,
        result_encrypted: divination.resultMessage,
        result_preview: resultPreview,
        after_message: divination.afterMessage,
        is_unlocked: false,
      })
      .select()
      .single()

    if (insertError || !savedDivination) {
      console.error('鑑定結果保存エラー:', insertError)
      return NextResponse.json(
        { success: false, message: '鑑定結果の保存に失敗しました' },
        { status: 500 }
      )
    }

    const savedDivinationId = savedDivination.id

    console.log('鑑定結果を送信しました')

    // 5秒待機
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 3. 鑑定後メッセージを保存
    const { error: afterError } = await adminSupabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'fortune_teller',
        content: divination.afterMessage,
        is_divination_request: false,
      })

    if (afterError) {
      console.error('鑑定後メッセージ保存エラー:', afterError)
      // 鑑定後メッセージの保存に失敗してもエラーにはしない
    } else {
      console.log('鑑定後メッセージを送信しました')
    }

    console.log('鑑定の3つのメッセージを全て送信しました')

    // レスポンスを返却（全メッセージ送信済み）
    // クライアント側のRealtimeサブスクリプションでリアルタイムに表示される
    const response: GenerateDivinationResponse = {
      success: true,
      message: '鑑定を開始しました',
      data: {
        divination: {
          id: savedDivinationId,
          greetingMessage: divination.greetingMessage,
          resultPreview: resultPreview,
          afterMessage: divination.afterMessage,
          isUnlocked: false,
          pointsConsumed: null,
          unlockedAt: null,
          createdAt: savedDivination.created_at,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('鑑定生成エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: '鑑定の生成に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
