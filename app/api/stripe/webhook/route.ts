import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * Stripe Webhook処理
 *
 * 決済完了時にポイントを付与します
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    console.error('Webhook Error: 署名がありません')
    return NextResponse.json(
      { error: 'Webhook signature missing' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    // Webhookイベントの検証
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook署名検証エラー:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // イベントタイプに応じた処理
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded:', event.data.object.id)
        break

      case 'payment_intent.payment_failed':
        console.log('PaymentIntent failed:', event.data.object.id)
        break

      default:
        console.log(`未処理のイベントタイプ: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook処理エラー:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * チェックアウトセッション完了時の処理
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const metadata = session.metadata
  if (!metadata) {
    console.error('Metadataが見つかりません')
    return
  }

  const {
    userId,
    points,
    couponId,
    campaignId,
    bonusPoints,
    discount,
  } = metadata

  console.log('決済完了:', {
    sessionId: session.id,
    userId,
    points,
    bonusPoints,
  })

  const supabaseAdmin = createAdminClient()

  // ポイントを付与
  const totalPoints = parseInt(points) + parseInt(bonusPoints || '0')

  try {
    // 1. user_pointsテーブルを更新
    const { data: currentPoints } = await supabaseAdmin
      .from('user_points')
      .select('points_balance')
      .eq('user_id', userId)
      .single()

    if (currentPoints) {
      // 既存のポイント残高を更新
      const { error: updateError } = await supabaseAdmin
        .from('user_points')
        .update({
          points_balance: currentPoints.points_balance + totalPoints,
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('ポイント更新エラー:', updateError)
        throw updateError
      }
    } else {
      // 新規レコードを作成
      const { error: insertError } = await supabaseAdmin
        .from('user_points')
        .insert({
          user_id: userId,
          points_balance: totalPoints,
        })

      if (insertError) {
        console.error('ポイント挿入エラー:', insertError)
        throw insertError
      }
    }

    // 2. points_transactionsテーブルに記録
    const { error: transactionError } = await supabaseAdmin
      .from('points_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'purchase',
        amount: totalPoints,
        description: `ポイント購入（Stripe）- ${points}pt${
          bonusPoints ? ` + ボーナス${bonusPoints}pt` : ''
        }`,
        stripe_session_id: session.id,
      })

    if (transactionError) {
      console.error('トランザクション記録エラー:', transactionError)
      throw transactionError
    }

    // 3. クーポン使用履歴を記録
    if (couponId) {
      const { error: couponUsageError } = await supabaseAdmin
        .from('coupon_usage')
        .insert({
          coupon_id: couponId,
          user_id: userId,
          discount_amount: parseInt(discount || '0'),
        })

      if (couponUsageError) {
        console.error('クーポン使用履歴エラー:', couponUsageError)
      }
    }

    // 4. キャンペーン使用履歴を記録
    if (campaignId && bonusPoints) {
      const { error: campaignUsageError } = await supabaseAdmin
        .from('campaign_usage')
        .insert({
          campaign_id: campaignId,
          user_id: userId,
          bonus_points: parseInt(bonusPoints),
        })

      if (campaignUsageError) {
        console.error('キャンペーン使用履歴エラー:', campaignUsageError)
      }
    }

    console.log(`ポイント付与成功: ${userId} に ${totalPoints}pt を付与`)
  } catch (error) {
    console.error('ポイント付与処理エラー:', error)
    throw error
  }
}
