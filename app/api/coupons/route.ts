import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { couponCode } = await request.json()

    if (!couponCode) {
      return NextResponse.json({ error: 'クーポンコードが必要です' }, { status: 400 })
    }

    const { data: coupon, error: couponError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .single()

    if (couponError || !coupon) {
      return NextResponse.json({ error: '無効なクーポンコードです' }, { status: 404 })
    }

    if (!coupon.is_active) {
      return NextResponse.json({ error: 'このクーポンは無効です' }, { status: 400 })
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: 'このクーポンは有効期限切れです' }, { status: 400 })
    }

    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return NextResponse.json({ error: 'このクーポンは使用上限に達しました' }, { status: 400 })
    }

    const { data: existingUsage } = await supabase
      .from('coupon_usage')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .single()

    if (existingUsage) {
      return NextResponse.json({ error: 'このクーポンは既に使用済みです' }, { status: 400 })
    }

    let pointsToGrant = 0
    if (coupon.discount_type === 'points') {
      pointsToGrant = coupon.discount_value
    }

    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points_balance')
      .eq('user_id', user.id)
      .single()

    const currentBalance = userPoints?.points_balance || 0
    const newBalance = currentBalance + pointsToGrant

    await supabase
      .from('user_points')
      .update({ points_balance: newBalance })
      .eq('user_id', user.id)

    await supabase.from('coupon_usage').insert({
      coupon_id: coupon.id,
      user_id: user.id,
      points_granted: pointsToGrant,
    })

    await supabase
      .from('coupons')
      .update({ current_uses: (coupon.current_uses || 0) + 1 })
      .eq('id', coupon.id)

    await supabase.from('points_transactions').insert({
      user_id: user.id,
      transaction_type: 'purchase',
      amount: pointsToGrant,
      points_before: currentBalance,
      points_after: newBalance,
      description: `クーポン使用: ${couponCode}`,
    })

    return NextResponse.json({
      success: true,
      message: 'クーポンを適用しました',
      pointsGranted: pointsToGrant,
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json({ error: '予期しないエラーが発生しました' }, { status: 500 })
  }
}
