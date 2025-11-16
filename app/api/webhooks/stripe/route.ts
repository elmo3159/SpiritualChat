import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

/**
 * Stripe Webhookハンドラー
 *
 * checkout.session.completedイベントを処理し、ポイントをユーザーに付与します
 * べき等性チェックにより、重複処理を防止します
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディとStripe署名ヘッダーを取得
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      console.error('Stripe署名ヘッダーが見つかりません')
      return NextResponse.json(
        { error: 'Stripe署名がありません' },
        { status: 400 }
      )
    }

    // Webhook署名を検証
    const stripe = getStripeClient()
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (err: any) {
      console.error('Webhook署名検証エラー:', err.message)
      return NextResponse.json(
        { error: `Webhook署名検証失敗: ${err.message}` },
        { status: 400 }
      )
    }

    // checkout.session.completedイベントを処理
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      // メタデータから必要な情報を取得
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId
      const points = parseInt(session.metadata?.points || '0')
      const couponId = session.metadata?.couponId || null
      const campaignId = session.metadata?.campaignId || null
      const bonusPoints = parseInt(session.metadata?.bonusPoints || '0')
      const discount = parseInt(session.metadata?.discount || '0')

      if (!userId || !points) {
        console.error('メタデータが不足しています:', session.metadata)
        return NextResponse.json(
          { error: 'メタデータが不足しています' },
          { status: 400 }
        )
      }

      // 合計ポイント（基本ポイント + ボーナスポイント）
      const totalPoints = points + bonusPoints

      // Supabaseクライアント作成（サービスロールキーで認証なしアクセス）
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      )

      // べき等性チェック: 同じstripe_session_idのトランザクションが既に存在するか確認
      const { data: existingTransaction } = await supabase
        .from('points_transactions')
        .select('id')
        .eq('stripe_session_id', session.id)
        .single()

      if (existingTransaction) {
        console.log(
          `既に処理済みのセッションです: ${session.id}, トランザクションID: ${existingTransaction.id}`
        )
        return NextResponse.json(
          { message: '既に処理済みです' },
          { status: 200 }
        )
      }

      // 現在のポイント残高を取得
      const { data: userPoints, error: fetchError } = await supabase
        .from('user_points')
        .select('points_balance')
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        console.error('ポイント残高取得エラー:', fetchError)
        return NextResponse.json(
          { error: 'ポイント残高の取得に失敗しました' },
          { status: 500 }
        )
      }

      const currentBalance = userPoints?.points_balance || 0
      const newBalance = currentBalance + totalPoints

      // ポイント残高更新
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          points_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('ポイント残高更新エラー:', updateError)
        return NextResponse.json(
          { error: 'ポイント残高の更新に失敗しました' },
          { status: 500 }
        )
      }

      // トランザクション履歴を記録（基本ポイント購入）
      let description = `ポイント購入: ${planId}`
      if (discount > 0) {
        description += ` (${discount}円割引適用)`
      }

      const { error: transactionError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'purchase',
          amount: points,
          points_before: currentBalance,
          points_after: currentBalance + points,
          reference_type: 'stripe_checkout',
          reference_id: planId,
          stripe_session_id: session.id,
          description,
        })

      if (transactionError) {
        console.error('トランザクション履歴記録エラー:', transactionError)
      }

      // クーポン使用記録
      if (couponId) {
        const { error: couponUsageError } = await supabase
          .from('coupon_usage')
          .insert({
            coupon_id: couponId,
            user_id: userId,
            stripe_session_id: session.id,
          })

        if (couponUsageError) {
          console.error('クーポン使用記録エラー:', couponUsageError)
        }
      }

      // ボーナスポイント付与記録（キャンペーン）
      if (bonusPoints > 0 && campaignId) {
        const { error: bonusError } = await supabase
          .from('points_transactions')
          .insert({
            user_id: userId,
            transaction_type: 'bonus',
            amount: bonusPoints,
            points_before: currentBalance + points,
            points_after: newBalance,
            reference_type: 'campaign',
            reference_id: campaignId,
            stripe_session_id: session.id,
            description: `キャンペーンボーナス: +${bonusPoints}pt`,
          })

        if (bonusError) {
          console.error('ボーナスポイント記録エラー:', bonusError)
        }
      }

      console.log(
        `ポイント付与完了: ユーザー ${userId}, +${points}pt ${bonusPoints > 0 ? `(+${bonusPoints}pt ボーナス) ` : ''}(${currentBalance} → ${newBalance})`
      )
    }

    // 正常終了
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error: any) {
    console.error('Webhook処理エラー:', error)
    return NextResponse.json(
      { error: 'Webhook処理に失敗しました' },
      { status: 500 }
    )
  }
}
