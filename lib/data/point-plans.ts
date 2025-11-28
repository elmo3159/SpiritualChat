/**
 * ポイント購入プランの定義
 *
 * まとめ買いほどお得になる価格体系
 * 最小プラン: 480円で500ポイント（1回の鑑定分）
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
  badge?: 'popular' | 'recommended' | 'best-value' | 'first-time'

  /**
   * 初回購入者限定プランかどうか
   */
  isFirstTimeOnly?: boolean

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
 * 1鑑定 = 500pt（480円で購入可能）を基準とした価格体系
 * まとめ買いするほどお得になる設計：
 * - 500pt: 割引なし（お試しプラン）
 * - 1,500pt: 10%割引（人気プラン）
 * - 2,500pt: 10%割引
 * - 5,000pt: 15%割引（おすすめプラン）
 * - 15,000pt: 20%割引（VIPプラン）
 */
export const POINT_PLANS: PointPlan[] = [
  {
    id: 'plan-first-time',
    name: '✨ 初回限定プラン',
    points: 500,
    price: 100,
    discountRate: 79,
    regularPrice: 480,
    badge: 'first-time',
    isFirstTimeOnly: true,
    stripePriceId: 'price_1SYKK6D8HZjEJ3xYY9UQmJlX',
    description: '初めての方限定！鑑定結果1回分が特別価格',
  },
  {
    id: 'plan-test-100',
    name: '🧪 テストプラン',
    points: 100,
    price: 100,
    discountRate: 0,
    regularPrice: 100,
    description: 'システムテスト用（テスト完了後削除予定）',
  },
  {
    id: 'plan-500',
    name: 'ライトプラン',
    points: 500,
    price: 480,
    discountRate: 0,
    regularPrice: 480,
    description: '鑑定結果1回分',
  },
  {
    id: 'plan-1500',
    name: '通常プラン',
    points: 1500,
    price: 1350,
    discountRate: 10,
    regularPrice: 1500,
    badge: 'popular',
    description: '鑑定結果3回分、10%お得！',
  },
  {
    id: 'plan-2500',
    name: 'スタンダードプラン',
    points: 2500,
    price: 2250,
    discountRate: 10,
    regularPrice: 2500,
    description: '鑑定結果5回分、10%お得！',
  },
  {
    id: 'plan-5000',
    name: 'プレミアムプラン',
    points: 5000,
    price: 4250,
    discountRate: 15,
    regularPrice: 5000,
    badge: 'recommended',
    description: '鑑定結果10回分、15%お得！',
  },
  {
    id: 'plan-15000',
    name: 'VIPプラン',
    points: 15000,
    price: 12000,
    discountRate: 20,
    regularPrice: 15000,
    badge: 'best-value',
    description: '鑑定結果31回分、20%お得！',
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
    case 'first-time':
      return '初回限定'
    default:
      return null
  }
}
