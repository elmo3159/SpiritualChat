import Stripe from 'stripe'

/**
 * Stripeクライアントインスタンスを取得
 *
 * サーバーサイドでのみ使用
 * Server Action内で呼び出すことで環境変数が確実に利用可能
 */
export function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set')
    throw new Error(
      'STRIPE_SECRET_KEY環境変数が設定されていません。Vercelダッシュボードで環境変数を設定してください。'
    )
  }

  console.log('Creating Stripe client with API version: 2025-10-29.clover')

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-10-29.clover',
    typescript: true,
  })
}
