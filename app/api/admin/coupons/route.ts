import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * クーポン作成API
 * POST /api/admin/coupons
 */
export async function POST(request: NextRequest) {
  try {
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

    // コードの重複チェック
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code)
      .single()

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: 'このクーポンコードは既に使用されています' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
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
      .select()
      .single()

    if (error) {
      console.error('クーポン作成エラー:', error)
      return NextResponse.json(
        { success: false, message: 'クーポンの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'クーポンを作成しました',
      data,
    })
  } catch (error: any) {
    console.error('クーポン作成エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
