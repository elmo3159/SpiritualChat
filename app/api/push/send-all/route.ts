import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

export interface PushNotificationPayload {
  title: string
  body: string
  url?: string
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
}

/**
 * 全ユーザーにプッシュ通知送信API
 *
 * POST /api/push/send-all
 *
 * リクエストボディ:
 * {
 *   notification: PushNotificationPayload (通知内容)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // VAPID設定（実行時に環境変数を読み込む）
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@spiritualchat.pro'

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { success: false, error: 'VAPID設定が見つかりません' },
        { status: 500 }
      )
    }

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

    const supabase = await createClient()

    // 認証チェック（管理者のみ）
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // TODO: 管理者権限チェック（profiles.is_adminなど）
    // 現在は認証済みユーザーなら誰でも送信可能（本番では要修正）

    const { notification } = await request.json()

    if (!notification) {
      return NextResponse.json(
        { success: false, error: '通知内容が指定されていません' },
        { status: 400 }
      )
    }

    // すべてのサブスクリプションを取得
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('*')

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
    let sentCount = 0
    let failedCount = 0

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
          sentCount++
          return { success: true, endpoint: sub.endpoint }
        } catch (error: any) {
          console.error('プッシュ通知送信エラー:', error)
          failedCount++

          // エンドポイントが無効な場合は削除
          if (error.statusCode === 410 || error.statusCode === 404) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', sub.endpoint)
          }

          return { success: false, endpoint: sub.endpoint, error: '送信に失敗しました' }
        }
      })
    )

    // 送信履歴を保存
    const { error: historyError } = await supabase
      .from('push_notification_history')
      .insert({
        title: notification.title,
        body: notification.body,
        url: notification.url || null,
        icon: notification.icon || null,
        target_type: 'all',
        target_user_id: null,
        sent_count: sentCount,
        failed_count: failedCount,
        sent_by: user.id,
      })

    if (historyError) {
      console.error('履歴保存エラー:', historyError)
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      total: subscriptions.length,
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
