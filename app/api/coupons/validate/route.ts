import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * クーポン検証API
 * POST /api/coupons/validate
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { code } = body

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

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'クーポンコードを入力してください' },
        { status: 400 }
      )
    }

    // クーポンを取得
    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()

    if (couponError || !coupon) {
      return NextResponse.json(
        { success: false, error: 'クーポンコードが見つかりません' },
        { status: 404 }
      )
    }

    // バリデーション
    const now = new Date()

    // 有効化チェック
    if (!coupon.is_active) {
      return NextResponse.json(
        { success: false, error: 'このクーポンは無効化されています' },
        { status: 400 }
      )
    }

    // 有効期限チェック
    if (new Date(coupon.valid_from) > now) {
      return NextResponse.json(
        { success: false, error: 'このクーポンはまだ使用できません' },
        { status: 400 }
      )
    }

    if (new Date(coupon.valid_until) < now) {
      return NextResponse.json(
        { success: false, error: 'このクーポンは有効期限が切れています' },
        { status: 400 }
      )
    }

    // 対象ユーザーチェック
    if (coupon.target_users === 'specific') {
      if (!coupon.specific_user_ids || !coupon.specific_user_ids.includes(user.id)) {
        return NextResponse.json(
          { success: false, error: 'このクーポンは使用できません' },
          { status: 403 }
        )
      }
    }

    // 総使用回数チェック
    if (coupon.max_uses) {
      const { count: totalUsageCount } = await supabase
        .from('coupon_usage')
        .select('*', { count: 'exact', head: true })
        .eq('coupon_id', coupon.id)

      if (totalUsageCount && totalUsageCount >= coupon.max_uses) {
        return NextResponse.json(
          { success: false, error: 'このクーポンは使用回数の上限に達しています' },
          { status: 400 }
        )
      }
    }

    // ユーザーごとの使用回数チェック
    const { count: userUsageCount } = await supabase
      .from('coupon_usage')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)

    if (userUsageCount && userUsageCount >= coupon.max_uses_per_user) {
      return NextResponse.json(
        { success: false, error: 'このクーポンの使用回数上限に達しています' },
        { status: 400 }
      )
    }

    // 検証成功
    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
    })
  } catch (error: any) {
    console.error('クーポン検証エラー:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
