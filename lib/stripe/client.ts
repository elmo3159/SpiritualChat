import Stripe from 'stripe'

/**
 * Stripeクライアントインスタンスを取得
 *
 * サーバーサイドでのみ使用
 */
function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set')
    throw new Error(
      'STRIPE_SECRET_KEY環境変数が設定されていません。Vercelダッシュボードで環境変数を設定してください。'
    )
  }

  console.log('Creating Stripe client with API version: 2024-11-20')

  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20' as any,
    typescript: true,
  })
}

/**
 * Stripeクライアントインスタンス
 *
 * 毎回新しいインスタンスを作成することで環境変数の読み込みタイミング問題を回避
 */
export const stripe = getStripeClient()
