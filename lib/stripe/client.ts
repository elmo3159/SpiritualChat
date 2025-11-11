import Stripe from 'stripe'

/**
 * Stripeクライアントインスタンス
 *
 * サーバーサイドでのみ使用
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})
