import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { generateContent } from '@/lib/gemini'
import { buildRegenerateSuggestionPrompt } from '@/lib/gemini/prompts'
import { cleanupMessageText } from '@/lib/utils/text-cleanup'

/**
 * 鑑定結果開封後の提案文送信API
 *
 * POST /api/chat/post-unlock-suggestion
 *
 * 鑑定結果開封後、1分後にクライアントから呼び出され、次の提案文を生成・送信します
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
    const { divinationId } = body

    if (!divinationId) {
      return NextResponse.json(
        { success: false, message: '鑑定結果IDが必要です' },
        { status: 400 }
      )
    }

    // 鑑定結果を取得
    const { data: divination, error: divinationError } = await supabase
      .from('divination_results')
      .select('*')
      .eq('id', divinationId)
      .eq('user_id', user.id) // ユーザー所有確認
      .single()

    if (divinationError || !divination) {
      return NextResponse.json(
        { success: false, message: '鑑定結果が見つかりません' },
        { status: 404 }
      )
    }

    // 開封済みでない場合はエラー
    if (!divination.is_unlocked) {
      return NextResponse.json(
        { success: false, message: 'この鑑定結果は開封されていません' },
        { status: 400 }
      )
    }

    // 占い師情報を取得
    const { data: fortuneTeller } = await supabase
      .from('fortune_tellers')
      .select('*')
      .eq('id', divination.fortune_teller_id)
      .single()

    if (!fortuneTeller) {
      return NextResponse.json(
        { success: false, message: '占い師が見つかりません' },
        { status: 404 }
      )
    }

    // ユーザープロフィールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'プロフィールが見つかりません' },
        { status: 404 }
      )
    }

    // チャット履歴を取得
    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', divination.fortune_teller_id)
      .order('created_at', { ascending: true })
      .limit(10)

    const chatHistory = messages?.map((msg) => ({
      role: (msg.sender_type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content,
    })) || []

    // 過去の鑑定結果を取得（開封済みのもののみ、今開封したものを除く）
    const { data: previousDivinations } = await supabase
      .from('divination_results')
      .select('result_encrypted')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', divination.fortune_teller_id)
      .eq('is_unlocked', true)
      .neq('id', divinationId) // 今開封したものを除く
      .order('created_at', { ascending: false })
      .limit(3)

    const previousDivinationTexts = previousDivinations
      ? previousDivinations.map((d) => d.result_encrypted)
      : []

    // ユーザーの年齢を計算
    const userAge = calculateAge(profile.birth_date)

    // 現在の日本時間を取得
    const currentJapanTime = getCurrentJapanTime()

    const context = {
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

    // 今開封した鑑定結果を最新コンテンツとして使用
    const prompt = buildRegenerateSuggestionPrompt(
      fortuneTeller.suggestion_prompt,
      context,
      divination.result_encrypted, // 開封された鑑定結果全文
      true // 鑑定結果からの再生成
    )

    const rawSuggestion = await generateContent(prompt)
    const suggestion = cleanupMessageText(rawSuggestion)

    // Admin Clientを使用して提案をチャットメッセージとして保存
    const adminSupabase = createAdminClient()
    const { error: insertError } = await adminSupabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        fortune_teller_id: divination.fortune_teller_id,
        sender_type: 'fortune_teller',
        content: suggestion,
        is_divination_request: false,
      })

    if (insertError) {
      console.error('提案メッセージ保存エラー:', insertError)
      return NextResponse.json(
        { success: false, message: '提案の保存に失敗しました' },
        { status: 500 }
      )
    }

    console.log('鑑定開封後の提案文を送信しました')

    return NextResponse.json({
      success: true,
      message: '提案を送信しました',
    })
  } catch (error: any) {
    console.error('提案送信エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: '提案の送信に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
