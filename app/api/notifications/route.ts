import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/notifications
 * ユーザーの通知一覧を取得
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // クエリパラメータから未読のみフィルタ
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'

    // 通知を取得
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error: notificationsError } = await query

    if (notificationsError) {
      console.error('通知取得エラー:', notificationsError)
      return NextResponse.json(
        { error: '通知の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      notifications: notifications || [],
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/notifications
 * 通知を既読にする
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { notificationIds } = await request.json()

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { error: '通知IDが必要です' },
        { status: 400 }
      )
    }

    // 通知を既読にする
    const { error: updateError } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .in('id', notificationIds)

    if (updateError) {
      console.error('通知更新エラー:', updateError)
      return NextResponse.json(
        { error: '通知の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '通知を既読にしました',
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
