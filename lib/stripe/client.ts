import Stripe from 'stripe'

/**
 * Stripeクライアントインスタンス（遅延初期化）
 *
 * サーバーサイドでのみ使用
 */
let stripeInstance: Stripe | null = null

export const getStripe = (): Stripe => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        'STRIPE_SECRET_KEY環境変数が設定されていません。Vercelダッシュボードで環境変数を設定してください。'
      )
    }

    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    })
  }

  return stripeInstance
}

// 後方互換性のため、stripeエクスポートも維持
export const stripe = new Proxy({} as Stripe, {
  get(target, prop) {
    return getStripe()[prop as keyof Stripe]
  },
})
