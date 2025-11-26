import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

// 運勢データ更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    // リクエストボディを取得
    const body = await request.json()
    const { overall, focus_area, advice, lucky_color, lucky_item, lucky_action } = body

    // データを更新
    const { error } = await supabase
      .from('daily_fortunes')
      .update({
        overall,
        focus_area,
        advice,
        lucky_color: lucky_color || null,
        lucky_item: lucky_item || null,
        lucky_action: lucky_action || null,
      })
      .eq('id', params.id)

    if (error) {
      console.error('運勢データ更新エラー:', error)
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('運勢データ更新エラー:', error)
    return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 })
  }
}

// 運勢データ削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    console.log('=== 削除リクエスト受信 ===')
    console.log('削除対象ID:', params.id)

    const supabase = createAdminClient()

    // 削除前にデータが存在するか確認
    const { data: existing, error: checkError } = await supabase
      .from('daily_fortunes')
      .select('*')
      .eq('id', params.id)
      .single()

    console.log('削除前のデータ確認:', existing)
    console.log('確認エラー:', checkError)

    if (!existing) {
      console.error('データが見つかりません')
      return NextResponse.json({ error: 'データが見つかりません' }, { status: 404 })
    }

    // データを削除
    const { data: deleteResult, error } = await supabase
      .from('daily_fortunes')
      .delete()
      .eq('id', params.id)
      .select()

    console.log('削除結果:', deleteResult)
    console.log('削除エラー:', error)

    if (error) {
      console.error('運勢データ削除エラー:', error)
      return NextResponse.json({
        error: '削除に失敗しました',
      }, { status: 500 })
    }

    console.log('削除成功')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('運勢データ削除エラー:', error)
    return NextResponse.json({
      error: '削除に失敗しました',
    }, { status: 500 })
  }
}
