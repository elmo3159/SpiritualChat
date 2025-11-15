import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * プッシュ通知サブスクリプション解除API
 *
 * POST /api/push/unsubscribe
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

    // サブスクリプションをデータベースから削除
    const { error: deleteError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id)
      .eq('endpoint', subscription.endpoint)

    if (deleteError) {
      console.error('サブスクリプション削除エラー:', deleteError)
      return NextResponse.json(
        { success: false, error: 'サブスクリプションの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('サブスクリプション解除エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'サブスクリプションの解除に失敗しました',
      },
      { status: 500 }
    )
  }
}
