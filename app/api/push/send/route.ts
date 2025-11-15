import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

// VAPID設定
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@spiritualchat.pro'

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
}

export interface PushNotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

/**
 * プッシュ通知送信API
 *
 * POST /api/push/send
 *
 * リクエストボディ:
 * {
 *   userId: string (送信先ユーザーID)
 *   notification: PushNotificationPayload (通知内容)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック（管理者のみ実行可能にする場合はここで確認）
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { userId, notification } = await request.json()

    if (!userId || !notification) {
      return NextResponse.json(
        { success: false, error: '不正なリクエストです' },
        { status: 400 }
      )
    }

    // ユーザーのサブスクリプションを取得
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)

    if (fetchError) {
      console.error('サブスクリプション取得エラー:', fetchError)
      return NextResponse.json(
        { success: false, error: 'サブスクリプションの取得に失敗しました' },
        { status: 500 }
      )
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'サブスクリプションが見つかりません' },
        { status: 404 }
      )
    }

    // 各サブスクリプションに通知を送信
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        }

        try {
          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notification)
          )
          return { success: true, endpoint: sub.endpoint }
        } catch (error: any) {
          console.error('プッシュ通知送信エラー:', error)

          // エンドポイントが無効な場合は削除
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }

          return { success: false, endpoint: sub.endpoint, error: error.message }
        }
      })
    )

    const successCount = results.filter((r) => r.status === 'fulfilled').length
    const failedCount = results.length - successCount

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failedCount,
      results: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      ),
    })
  } catch (error: any) {
    console.error('プッシュ通知送信エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'プッシュ通知の送信に失敗しました',
      },
      { status: 500 }
    )
  }
}
