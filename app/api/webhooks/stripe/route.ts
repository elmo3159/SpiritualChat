import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { createLogger } from '@/lib/utils/logger'
import { logUserAction, logSystemAction } from '@/lib/security/audit-log'

const logger = createLogger('api:webhooks:stripe')

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
      logger.warn('Stripe署名ヘッダーが見つかりません')
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      logger.error('Webhook署名検証エラー', err instanceof Error ? err : undefined, {
        errorMessage,
      })
      return NextResponse.json(
        { error: 'Webhook署名検証に失敗しました' },
        { status: 400 }
      )
    }

    // checkout.session.completedイベントを処理
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      logger.info('Stripe Webhook受信', {
        eventId: event.id,
        sessionId: session.id,
        metadata: session.metadata,
      })

      // メタデータから必要な情報を取得
      const userId = session.metadata?.userId
      const planId = session.metadata?.planId
      const points = parseInt(session.metadata?.points || '0')
      const couponId = session.metadata?.couponId || null
      const campaignId = session.metadata?.campaignId || null
      const bonusPoints = parseInt(session.metadata?.bonusPoints || '0')
      const discount = parseInt(session.metadata?.discount || '0')

      if (!userId || !points) {
        logger.error('メタデータが不足しています', undefined, {
          metadata: session.metadata,
        })
        return NextResponse.json(
          { error: 'メタデータが不足しています' },
          { status: 400 }
        )
      }

      logger.debug('Webhook処理開始', {
        userId,
        points,
        bonusPoints,
        planId,
      })

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
      const { data: existingTransactions } = await supabase
        .from('points_transactions')
        .select('id')
        .eq('stripe_session_id', session.id)

      if (existingTransactions && existingTransactions.length > 0) {
        logger.info('既に処理済みのセッション', {
          sessionId: session.id,
          transactionId: existingTransactions[0].id,
        })
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
        logger.error('ポイント残高取得エラー', fetchError, { userId })
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
        logger.error('ポイント残高更新エラー', updateError, { userId })
        return NextResponse.json(
          { error: 'ポイント残高の更新に失敗しました' },
          { status: 500 }
        )
      }

      // トランザクション履歴を記録（基本ポイント購入）
      // UNIQUE constraint（stripe_session_id）で重複を防止
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
        // UNIQUE constraint違反は重複リクエストを意味する
        if (transactionError.code === '23505') {
          logger.info('重複Webhookを検出（constraint violation）', {
            sessionId: session.id,
          })
          return NextResponse.json(
            { message: '既に処理済みです' },
            { status: 200 }
          )
        }
        logger.error('トランザクション履歴記録エラー', transactionError, { userId })
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
          logger.error('クーポン使用記録エラー', couponUsageError, {
            userId,
            couponId,
          })
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
          logger.error('ボーナスポイント記録エラー', bonusError, {
            userId,
            campaignId,
            bonusPoints,
          })
        }
      }

      logger.info('ポイント付与完了', {
        userId,
        pointsAdded: points,
        bonusPoints,
        previousBalance: currentBalance,
        newBalance,
        sessionId: session.id,
        planId,
      })

      // 監査ログ：ポイント購入成功
      await logUserAction(userId, undefined, 'points_purchase', {
        resourceType: 'stripe_checkout',
        resourceId: session.id,
        details: {
          planId,
          pointsAdded: points,
          bonusPoints,
          totalPoints,
          previousBalance: currentBalance,
          newBalance,
          couponId,
          campaignId,
        },
      })
    }

    // 正常終了
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    logger.error('Webhook処理エラー', error instanceof Error ? error : undefined)
    return NextResponse.json(
      { error: 'Webhook処理に失敗しました' },
      { status: 500 }
    )
  }
}
