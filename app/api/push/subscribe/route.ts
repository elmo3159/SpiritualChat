import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * プッシュ通知サブスクリプション登録API
 *
 * POST /api/push/subscribe
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
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    // サブスクリプション情報を取得
    const subscription = await request.json()

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { success: false, error: '不正なサブスクリプションデータです' },
        { status: 400 }
      )
    }

    // サブスクリプションをデータベースに保存
    const { error: upsertError } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'endpoint',
        }
      )

    if (upsertError) {
      console.error('サブスクリプション保存エラー:', upsertError)
      return NextResponse.json(
        { success: false, error: 'サブスクリプションの保存に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('サブスクリプション登録エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'サブスクリプションの登録に失敗しました',
      },
      { status: 500 }
    )
  }
}
