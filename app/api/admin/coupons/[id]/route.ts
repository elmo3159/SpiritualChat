import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * クーポン削除API
 * DELETE /api/admin/coupons/[id]
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
      .from('coupons')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('クーポン削除エラー:', error)
      return NextResponse.json(
        { success: false, message: 'クーポンの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'クーポンを削除しました',
    })
  } catch (error: any) {
    console.error('クーポン削除エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * クーポンステータス更新API
 * PATCH /api/admin/coupons/[id]
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
      .from('coupons')
      .update({ is_active })
      .eq('id', params.id)

    if (error) {
      console.error('クーポンステータス更新エラー:', error)
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
    console.error('クーポンステータス更新エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * クーポン更新API
 * PUT /api/admin/coupons/[id]
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
      code,
      discount_type,
      discount_value,
      valid_from,
      valid_until,
      max_uses,
      max_uses_per_user,
      target_users,
      specific_user_ids,
      is_active,
    } = body

    // バリデーション
    if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
      return NextResponse.json(
        { success: false, message: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('coupons')
      .update({
        code,
        discount_type,
        discount_value,
        valid_from,
        valid_until,
        max_uses: max_uses || null,
        max_uses_per_user,
        target_users,
        specific_user_ids: specific_user_ids || null,
        is_active,
      })
      .eq('id', params.id)

    if (error) {
      console.error('クーポン更新エラー:', error)
      return NextResponse.json(
        { success: false, message: 'クーポンの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'クーポンを更新しました',
    })
  } catch (error: any) {
    console.error('クーポン更新エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
