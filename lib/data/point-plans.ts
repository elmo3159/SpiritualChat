/**
 * ポイント購入プランの定義
 *
 * 1ポイント = 1円の設定で、まとめ買いほどお得になる価格体系
 */

export interface PointPlan {
  /**
   * プランID
   */
  id: string

  /**
   * プラン名
   */
  name: string

  /**
   * 獲得ポイント数
   */
  points: number

  /**
   * 価格（円）
   */
  price: number

  /**
   * 割引率（%）
   */
  discountRate: number

  /**
   * 通常価格（割引前）
   */
  regularPrice: number

  /**
   * バッジ表示（人気、おすすめ、など）
   */
  badge?: 'popular' | 'recommended' | 'best-value'

  /**
   * Stripe Price ID（Stripeダッシュボードで作成後に設定）
   * 例: price_1234567890abcdef
   */
  stripePriceId?: string

  /**
   * プランの説明
   */
  description?: string
}

/**
 * ポイント購入プラン一覧
 *
 * まとめ買いするほどお得になる設計：
 * - 1,000pt: 割引なし（お試しプラン）
 * - 3,000pt: 10%割引（人気プラン）
 * - 5,000pt: 10%割引
 * - 10,000pt: 15%割引（おすすめプラン）
 * - 30,000pt: 20%割引（VIPプラン）
 */
export const POINT_PLANS: PointPlan[] = [
  {
    id: 'plan-1000',
    name: 'お試しプラン',
    points: 1000,
    price: 1000,
    discountRate: 0,
    regularPrice: 1000,
    description: '鑑定結果1回分',
  },
  {
    id: 'plan-3000',
    name: '通常プラン',
    points: 3000,
    price: 2700,
    discountRate: 10,
    regularPrice: 3000,
    badge: 'popular',
    description: '鑑定結果3回分、10%お得！',
  },
  {
    id: 'plan-5000',
    name: 'スタンダードプラン',
    points: 5000,
    price: 4500,
    discountRate: 10,
    regularPrice: 5000,
    description: '鑑定結果5回分、10%お得！',
  },
  {
    id: 'plan-10000',
    name: 'プレミアムプラン',
    points: 10000,
    price: 8500,
    discountRate: 15,
    regularPrice: 10000,
    badge: 'recommended',
    description: '鑑定結果10回分、15%お得！',
  },
  {
    id: 'plan-30000',
    name: 'VIPプラン',
    points: 30000,
    price: 24000,
    discountRate: 20,
    regularPrice: 30000,
    badge: 'best-value',
    description: '鑑定結果30回分、20%お得！',
  },
]

/**
 * プランIDからプランを取得
 */
export function getPlanById(planId: string): PointPlan | undefined {
  return POINT_PLANS.find((plan) => plan.id === planId)
}

/**
 * バッジの表示テキストを取得
 */
export function getBadgeLabel(badge?: PointPlan['badge']): string | null {
  switch (badge) {
    case 'popular':
      return '人気'
    case 'recommended':
      return 'おすすめ'
    case 'best-value':
      return '最もお得'
    default:
      return null
  }
}
