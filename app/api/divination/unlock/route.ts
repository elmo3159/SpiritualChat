import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import type { UnlockDivinationResponse } from '@/lib/types/divination'
import { resetMessageLimit } from '@/lib/supabase/message-limits'
import { updateLevelOnPointsUsed } from '@/lib/services/level-service'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { generateContent } from '@/lib/gemini'
import { buildRegenerateSuggestionPrompt } from '@/lib/gemini/prompts'
import { cleanupMessageText } from '@/lib/utils/text-cleanup'
import { createLogger } from '@/lib/utils/logger'
import { logUserAction } from '@/lib/security/audit-log'
import {
  unauthorizedResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
  errorResponse,
  ErrorCodes,
} from '@/lib/api/response'

const logger = createLogger('api:divination:unlock')

/**
 * 鑑定結果開封API
 *
 * POST /api/divination/unlock
 *
 * ポイントを消費して鑑定結果の全文を開封します
 * 開封後、サーバーサイドで次の提案文を自動生成・送信します
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse()
    }

    // リクエストボディを取得
    const body = await request.json()
    const { divinationId } = body

    if (!divinationId) {
      return validationErrorResponse('鑑定結果IDが必要です')
    }

    // 鑑定結果を取得
    const { data: divination, error: divinationError } = await supabase
      .from('divination_results')
      .select('*')
      .eq('id', divinationId)
      .eq('user_id', user.id) // ユーザー所有確認
      .single()

    if (divinationError || !divination) {
      return notFoundResponse('鑑定結果が見つかりません')
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
    const UNLOCK_COST = 480 // 開封コスト

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
      logger.error('ポイント消費エラー', consumeError, {
        userId: user.id,
        divinationId,
      })
      // 監査ログ：エラー
      await logUserAction(user.id, user.email, 'divination_unlock', {
        resourceType: 'divination_result',
        resourceId: divinationId,
        status: 'error',
        errorMessage: 'ポイント消費に失敗しました',
        details: { cost: UNLOCK_COST },
      })
      return internalErrorResponse('ポイント消費に失敗しました')
    }

    // consume_points関数の返り値を確認
    if (!consumeResult || !consumeResult.success) {
      const errorMessage =
        consumeResult?.error === 'insufficient_points'
          ? 'ポイントが不足しています'
          : 'ポイント消費に失敗しました'

      logger.info('ポイント不足', {
        userId: user.id,
        divinationId,
        error: consumeResult?.error,
      })
      // 監査ログ：失敗
      await logUserAction(user.id, user.email, 'divination_unlock', {
        resourceType: 'divination_result',
        resourceId: divinationId,
        status: 'failure',
        errorMessage: errorMessage,
        details: { cost: UNLOCK_COST, reason: consumeResult?.error },
      })

      return errorResponse(ErrorCodes.INSUFFICIENT_POINTS, errorMessage, 400)
    }

    // ポイント消費成功 → 経験値とレベルを更新
    await updateLevelOnPointsUsed(user.id, UNLOCK_COST)

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
      logger.error('鑑定結果更新エラー', updateError, {
        userId: user.id,
        divinationId,
      })
      return internalErrorResponse('鑑定結果の更新に失敗しました')
    }

    logger.info('鑑定結果開封成功', {
      userId: user.id,
      divinationId,
      pointsConsumed: UNLOCK_COST,
      newBalance: consumeResult.new_balance,
    })
    // 監査ログ：成功
    await logUserAction(user.id, user.email, 'divination_unlock', {
      resourceType: 'divination_result',
      resourceId: divinationId,
      details: {
        cost: UNLOCK_COST,
        newBalance: consumeResult.new_balance,
        fortuneTellerId: divination.fortune_teller_id,
      },
    })

    // メッセージ送信回数制限をリセット
    await resetMessageLimit(supabase, user.id, divination.fortune_teller_id)

    // ============================================================
    // 次の提案文をサーバーサイドで生成・送信
    // ブラウザを閉じても確実に実行される
    // ============================================================
    try {
      logger.debug('開封後の提案文生成を開始', { userId: user.id, divinationId })

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
            .neq('id', divinationId)
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
            divination.result_encrypted,
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
            logger.error('提案メッセージ保存エラー', insertError, {
              userId: user.id,
              fortuneTellerId: divination.fortune_teller_id,
            })
          } else {
            logger.debug('開封後の提案文を送信', {
              userId: user.id,
              fortuneTellerId: divination.fortune_teller_id,
            })
          }
        }
      }
    } catch (suggestionError) {
      // 提案文生成に失敗しても開封処理自体は成功しているので、エラーログのみ
      logger.error('提案文生成エラー（開封は成功）', suggestionError, {
        userId: user.id,
        divinationId,
      })
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
  } catch (error) {
    logger.error('鑑定結果開封エラー', error)
    return internalErrorResponse('鑑定結果の開封に失敗しました')
  }
}
