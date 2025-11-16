import Stripe from 'stripe'

/**
 * Stripeクライアントインスタンス
 *
 * サーバーサイドでのみ使用
 */
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    'STRIPE_SECRET_KEY環境変数が設定されていません。Vercelダッシュボードで環境変数を設定してください。'
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})
