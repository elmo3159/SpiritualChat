import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * キャンペーン削除API
 * DELETE /api/admin/campaigns/[id]
 */
export async function DELETE(
  request: NextRequest,
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

    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('キャンペーン削除エラー:', error)
      return NextResponse.json(
        { success: false, message: 'キャンペーンの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'キャンペーンを削除しました',
    })
  } catch (error: any) {
    console.error('キャンペーン削除エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * キャンペーンステータス更新API
 * PATCH /api/admin/campaigns/[id]
 */
export async function PATCH(
  request: NextRequest,
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
    const body = await request.json()
    const { is_active } = body

    const { error } = await supabase
      .from('campaigns')
      .update({ is_active })
      .eq('id', params.id)

    if (error) {
      console.error('キャンペーンステータス更新エラー:', error)
      return NextResponse.json(
        { success: false, message: 'ステータスの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ステータスを更新しました',
    })
  } catch (error: any) {
    console.error('キャンペーンステータス更新エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * キャンペーン更新API
 * PUT /api/admin/campaigns/[id]
 */
export async function PUT(
  request: NextRequest,
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
    const body = await request.json()

    const {
      name,
      description,
      start_date,
      end_date,
      bonus_percentage,
      banner_image_url,
      is_active,
    } = body

    // バリデーション
    if (!name || !description || !start_date || !end_date || !bonus_percentage) {
      return NextResponse.json(
        { success: false, message: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    if (bonus_percentage <= 0 || bonus_percentage > 100) {
      return NextResponse.json(
        { success: false, message: 'ボーナス率は1〜100%の範囲で入力してください' },
        { status: 400 }
      )
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return NextResponse.json(
        { success: false, message: '終了日は開始日より後の日付を指定してください' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('campaigns')
      .update({
        name,
        description,
        start_date,
        end_date,
        bonus_percentage,
        banner_image_url: banner_image_url || null,
        is_active,
      })
      .eq('id', params.id)

    if (error) {
      console.error('キャンペーン更新エラー:', error)
      return NextResponse.json(
        { success: false, message: 'キャンペーンの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'キャンペーンを更新しました',
    })
  } catch (error: any) {
    console.error('キャンペーン更新エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
