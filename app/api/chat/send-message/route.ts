import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAndSaveAIResponse } from '@/lib/ai/generate-response'
import {
  checkMessageLimit,
  incrementMessageCount,
} from '@/lib/supabase/message-limits'
import { createLogger } from '@/lib/utils/logger'
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
  errorResponse,
  ErrorCodes,
} from '@/lib/api/response'

const logger = createLogger('api:chat:send-message')

/**
 * メッセージ送信API
 *
 * POST /api/chat/send-message
 *
 * ユーザーからのメッセージを保存し、
 * AI占い師からの自動応答を生成します
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
    const { fortuneTellerId, content } = body

    if (!fortuneTellerId || !content) {
      return validationErrorResponse('占い師IDとメッセージ内容が必要です')
    }

    // メッセージ内容の長さチェック（1000文字まで）
    if (content.length > 1000) {
      return validationErrorResponse('メッセージは1000文字以内で入力してください')
    }

    // プロフィール取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return notFoundResponse('プロフィールが見つかりません')
    }

    // 占い師の存在確認
    const { data: fortuneTeller, error: fortuneTellerError } = await supabase
      .from('fortune_tellers')
      .select('id, name')
      .eq('id', fortuneTellerId)
      .eq('is_active', true)
      .single()

    if (fortuneTellerError || !fortuneTeller) {
      return notFoundResponse('占い師が見つかりません')
    }

    // メッセージ送信制限をチェック
    const limitCheck = await checkMessageLimit(
      supabase,
      profile.id,
      fortuneTellerId
    )

    if (!limitCheck.canSend) {
      logger.info('メッセージ送信制限に到達', {
        userId: user.id,
        fortuneTellerId,
        remaining: limitCheck.remainingCount,
      })
      return errorResponse(
        ErrorCodes.DAILY_LIMIT_REACHED,
        limitCheck.message ||
          '本日のメッセージ送信回数の上限に達しました。鑑定結果を開封するとリセットされます。',
        429
      )
    }

    // ユーザーメッセージを保存
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: profile.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'user',
        content: content,
        is_divination_request: false,
      })
      .select()
      .single()

    if (userMessageError) {
      logger.error('ユーザーメッセージ保存エラー', userMessageError, {
        userId: user.id,
        fortuneTellerId,
      })
      return internalErrorResponse('メッセージの保存に失敗しました')
    }

    // メッセージ送信回数を更新
    const incrementSuccess = await incrementMessageCount(
      supabase,
      profile.id,
      fortuneTellerId
    )

    if (!incrementSuccess) {
      logger.warn('メッセージカウント更新に失敗', {
        userId: user.id,
        fortuneTellerId,
      })
      // カウント更新失敗でもメッセージは保存されているのでエラーにはしない
    }

    logger.debug('メッセージ送信成功', {
      userId: user.id,
      fortuneTellerId,
      messageId: userMessage.id,
    })

    // AI応答を生成（非同期で実行、すぐにレスポンスを返す）
    generateAndSaveAIResponse(profile.id, fortuneTellerId, content).catch(
      (error) => {
        logger.error('AI応答生成の非同期実行でエラー', error, {
          userId: user.id,
          fortuneTellerId,
        })
      }
    )

    return successResponse({
      message: userMessage,
      remaining_messages: Math.max(0, limitCheck.remainingCount - 1),
    })
  } catch (error) {
    logger.error('メッセージ送信エラー', error)
    return internalErrorResponse('メッセージの送信に失敗しました')
  }
}

