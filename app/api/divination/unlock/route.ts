import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UnlockDivinationResponse } from '@/lib/types/divination'
import { resetMessageLimit, MAX_MESSAGES_PER_DAY } from '@/lib/supabase/message-limits'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { generateContent } from '@/lib/gemini'
import { buildRegenerateSuggestionPrompt } from '@/lib/gemini/prompts'
import { cleanupMessageText } from '@/lib/utils/text-cleanup'

/**
 * 鑑定結果開封API
 *
 * POST /api/divination/unlock
 *
 * ポイントを消費して鑑定結果の全文を開封します
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

    // 既に開封済みかチェック
    if (divination.is_unlocked) {
      return NextResponse.json({
        success: true,
        message: 'この鑑定結果は既に開封済みです',
        data: {
          resultFull: divination.result_encrypted,
          pointsConsumed: divination.points_consumed || 0,
          newBalance: 0, // 既に開封済みなので残高は変わらない
        },
      })
    }

    // ポイント消費（consume_points関数を呼び出し）
    const UNLOCK_COST = 1000 // 開封コスト

    const { data: consumeResult, error: consumeError } = await supabase.rpc(
      'consume_points',
      {
        p_user_id: user.id,
        p_amount: UNLOCK_COST,
        p_reference_type: 'divination_result',
        p_reference_id: divinationId,
        p_description: '鑑定結果の開封',
      }
    )

    if (consumeError) {
      console.error('ポイント消費エラー:', consumeError)
      return NextResponse.json(
        { success: false, message: 'ポイント消費に失敗しました' },
        { status: 500 }
      )
    }

    // consume_points関数の返り値を確認
    if (!consumeResult || !consumeResult.success) {
      const errorMessage =
        consumeResult?.error === 'insufficient_points'
          ? 'ポイントが不足しています'
          : 'ポイント消費に失敗しました'

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      )
    }

    // 鑑定結果を開封済みに更新
    const { error: updateError } = await supabase
      .from('divination_results')
      .update({
        is_unlocked: true,
        points_consumed: UNLOCK_COST,
        unlocked_at: new Date().toISOString(),
      })
      .eq('id', divinationId)
      .eq('user_id', user.id) // セキュリティのため再確認

    if (updateError) {
      console.error('鑑定結果更新エラー:', updateError)
      return NextResponse.json(
        { success: false, message: '鑑定結果の更新に失敗しました' },
        { status: 500 }
      )
    }

    // メッセージ送信回数制限をリセット
    await resetMessageLimit(supabase, user.id, divination.fortune_teller_id)

    // 次の鑑定提案を同期的に生成・送信
    try {
      // 占い師情報を取得
      const { data: fortuneTeller } = await supabase
        .from('fortune_tellers')
        .select('*')
        .eq('id', divination.fortune_teller_id)
        .single()

      if (fortuneTeller) {
        // ユーザープロフィールを取得
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profile) {
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
          await adminSupabase
            .from('chat_messages')
            .insert({
              user_id: user.id,
              fortune_teller_id: divination.fortune_teller_id,
              sender_type: 'fortune_teller',
              content: suggestion,
              is_divination_request: false,
            })

          console.log('次の鑑定提案を送信しました')
        }
      }
    } catch (error) {
      console.error('次の鑑定提案送信エラー:', error)
      // エラーでもレスポンスは返す（提案生成失敗は致命的ではない）
    }

    // レスポンスを返却
    const response: UnlockDivinationResponse = {
      success: true,
      data: {
        resultFull: divination.result_encrypted,
        pointsConsumed: UNLOCK_COST,
        newBalance: consumeResult.new_balance,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('鑑定結果開封エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: '鑑定結果の開封に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
