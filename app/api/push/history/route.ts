import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * プッシュ通知履歴取得API
 *
 * GET /api/push/history
 */
export async function GET(request: NextRequest) {
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

    // TODO: 管理者権限チェック

    // クエリパラメータ
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // 通知履歴を取得
    const { data: history, error: fetchError, count } = await supabase
      .from('push_notification_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (fetchError) {
      console.error('履歴取得エラー:', fetchError)
      return NextResponse.json(
        { success: false, error: '履歴の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: history || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('履歴取得エラー:', error)
    return NextResponse.json(
      {
        success: false,
        error: '履歴の取得に失敗しました',
      },
      { status: 500 }
    )
  }
}
