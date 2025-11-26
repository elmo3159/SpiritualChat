import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/utils/logger'
import { logUserAction } from '@/lib/security/audit-log'
import {
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
  internalErrorResponse,
} from '@/lib/api/response'

const logger = createLogger('api:auth:change-password')

/**
 * パスワード変更API
 *
 * POST /api/auth/change-password
 *
 * ユーザーのパスワードを変更します
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
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return validationErrorResponse('現在のパスワードと新しいパスワードが必要です')
    }

    // 新しいパスワードのバリデーション
    if (newPassword.length < 6) {
      return validationErrorResponse('新しいパスワードは6文字以上である必要があります')
    }

    // 現在のパスワードを検証
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      logger.warn('パスワード検証失敗', { userId: user.id })
      // 監査ログ：失敗
      await logUserAction(user.id, user.email, 'password_change', {
        status: 'failure',
        errorMessage: '現在のパスワードが正しくありません',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })
      return validationErrorResponse('現在のパスワードが正しくありません')
    }

    // パスワードを更新
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      logger.error('パスワード更新エラー', updateError, { userId: user.id })
      // 監査ログ：エラー
      await logUserAction(user.id, user.email, 'password_change', {
        status: 'error',
        errorMessage: 'パスワードの更新に失敗しました',
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      })
      return internalErrorResponse('パスワードの更新に失敗しました')
    }

    logger.info('パスワード変更成功', { userId: user.id })
    // 監査ログ：成功
    await logUserAction(user.id, user.email, 'password_change', {
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return successResponse(undefined, 'パスワードを変更しました')
  } catch (error) {
    logger.error('パスワード変更エラー', error)
    return internalErrorResponse('パスワードの変更に失敗しました')
  }
}
