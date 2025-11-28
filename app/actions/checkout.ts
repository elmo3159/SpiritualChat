'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { getPlanById } from '@/lib/data/point-plans'

/**
 * Stripe CheckoutセッションURLを作成して返す
 *
 * @param planId ポイント購入プランID
 * @param couponCode オプションのクーポンコード
 * @returns Checkout URL
 */
export async function createCheckoutSession(
  planId: string,
  couponCode?: string
): Promise<{ url: string }> {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('ログインが必要です')
    }

    // プラン情報を取得
    const plan = getPlanById(planId)
    if (!plan) {
      throw new Error('無効なプランIDです')
    }

    // 初回限定プランの場合、購入履歴をチェック
    if (plan.isFirstTimeOnly) {
      const { count } = await supabaseAdmin
        .from('points_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('transaction_type', 'purchase')

      if (count && count > 0) {
        throw new Error('初回限定プランは既にご利用済みです')
      }
    }

    let finalPrice = plan.price
    let discount = 0
    let couponId: string | null = null
    let campaignId: string | null = null
    let bonusPoints = 0

    // クーポン適用処理
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single()

      if (coupon && coupon.is_active) {
        const now = new Date()
        const validFrom = new Date(coupon.valid_from)
        const validUntil = new Date(coupon.valid_until)

        // 有効期限チェック
        if (now >= validFrom && now <= validUntil) {
          // 使用回数チェック
          const { count: usageCount } = await supabaseAdmin
            .from('coupon_usage')
            .select('*', { count: 'exact', head: true })
            .eq('coupon_id', coupon.id)
            .eq('user_id', user.id)

          const canUse =
            !usageCount || usageCount < coupon.max_uses_per_user

          if (canUse) {
            couponId = coupon.id

            // 割引計算
            if (coupon.discount_type === 'percentage') {
              discount = Math.round((plan.price * coupon.discount_value) / 100)
            } else {
              discount = coupon.discount_value
            }

            finalPrice = Math.max(0, plan.price - discount)
          }
        }
      }
    }

    // アクティブなキャンペーンをチェック
    const now = new Date()
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now.toISOString())
      .gte('end_date', now.toISOString())
      .limit(1)
      .maybeSingle()

    if (campaigns) {
      campaignId = campaigns.id
      bonusPoints = Math.round((plan.points * campaigns.bonus_percentage) / 100)
    }

    // Stripe Checkoutセッションを作成（実行時に初期化）
    const stripe = getStripeClient()
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'] as any, // PayPayは自動的に表示されます
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: `${plan.name} - ${plan.points.toLocaleString()}ポイント`,
              description:
                discount > 0
                  ? `${plan.description || ''} (${discount.toLocaleString()}円割引適用)`
                  : plan.description || '',
            },
            unit_amount: finalPrice,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/points/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/points/purchase`,
      metadata: {
        userId: user.id,
        userEmail: user.email || '',
        planId: plan.id,
        points: plan.points.toString(),
        couponId: couponId || '',
        campaignId: campaignId || '',
        bonusPoints: bonusPoints.toString(),
        discount: discount.toString(),
      },
      customer_email: user.email || undefined,
      locale: 'ja',
    })

    // Checkout URLを返す
    return { url: checkoutSession.url! }
  } catch (error) {
    console.error('チェックアウトセッション作成エラー:', error)
    throw new Error('チェックアウトセッションの作成に失敗しました')
  }
}
