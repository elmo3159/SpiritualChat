import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/gemini'
import { buildInitialSuggestionPrompt } from '@/lib/gemini/prompts'
import type { DivinationContext } from '@/lib/gemini/types'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { cleanupMessageText } from '@/lib/utils/text-cleanup'

/**
 * 初回提案文生成API
 *
 * POST /api/chat/initial-suggestion
 *
 * ユーザーが初めて占い師とのチャットを開いたときの
 * 挨拶と相談提案を自動生成します
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
    const { fortuneTellerId } = body

    if (!fortuneTellerId) {
      return NextResponse.json(
        { success: false, message: '占い師IDが必要です' },
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
      chatHistory: [], // 初回なので履歴は空
      currentJapanTime,
    }

    // 初回提案プロンプトを構築
    const prompt = buildInitialSuggestionPrompt(
      fortuneTeller.suggestion_prompt,
      context
    )

    console.log('初回提案プロンプトを構築:', prompt.substring(0, 200) + '...')

    // Gemini APIで提案文を生成
    const rawSuggestion = await generateContent(prompt)

    // 生成された提案文から不要な文字列を削除
    const suggestion = cleanupMessageText(rawSuggestion)

    console.log('初回提案文を生成:', suggestion)

    // 初回メッセージをデータベースに保存
    const { error: saveError } = await supabase.from('chat_messages').insert({
      user_id: user.id,
      fortune_teller_id: fortuneTellerId,
      sender_type: 'fortune_teller',
      content: suggestion,
      is_divination_request: false,
    })

    if (saveError) {
      console.error('初回メッセージの保存に失敗:', saveError)
      // エラーでもメッセージは返す（保存失敗は致命的ではない）
    }

    return NextResponse.json({
      success: true,
      data: {
        greeting: suggestion,
      },
    })
  } catch (error: any) {
    console.error('初回提案生成エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: '初回提案の生成に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
