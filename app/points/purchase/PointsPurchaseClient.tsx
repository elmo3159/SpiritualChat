'use client'

import { useState, useEffect, useRef } from 'react'
import { Check, Sparkles, Clock, Gift, Zap } from 'lucide-react'
import { POINT_PLANS, getBadgeLabel, PointPlan } from '@/lib/data/point-plans'
import PurchaseButton from '@/app/components/points/PurchaseButton'
import CouponInput from '@/app/components/points/CouponInput'
import { trackMetaAddToCart } from '@/lib/analytics/meta-pixel'

interface CouponData {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
}

export default function PointsPurchaseClient() {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [visiblePlans, setVisiblePlans] = useState<PointPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstPurchase, setIsFirstPurchase] = useState(false)
  const [firstTimePlan, setFirstTimePlan] = useState<PointPlan | null>(null)
  const firstTimePlanRef = useRef<HTMLDivElement>(null)

  // 設定と初回購入判定を取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 並列で取得
        const [settingsRes, firstPurchaseRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/points/is-first-purchase'),
        ])

        const settingsData = await settingsRes.json()
        const firstPurchaseData = await firstPurchaseRes.json()

        setIsFirstPurchase(firstPurchaseData.isFirstPurchase)

        // 初回限定プランを取得
        const firstTime = POINT_PLANS.find((plan) => plan.isFirstTimeOnly)
        setFirstTimePlan(firstTime || null)

        // プランをフィルタリング（テストプランと初回限定プランを除外）
        let filteredPlans = POINT_PLANS.filter(
          (plan) => !plan.isFirstTimeOnly
        )

        if (settingsData.enable_test_plan === false) {
          filteredPlans = filteredPlans.filter(
            (plan) => plan.id !== 'plan-test-100'
          )
        }

        setVisiblePlans(filteredPlans)
      } catch (error) {
        console.error('データ取得エラー:', error)
        // エラー時は初回限定プラン以外を表示
        setVisiblePlans(
          POINT_PLANS.filter((plan) => !plan.isFirstTimeOnly)
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // ページ表示時にMeta Pixel AddToCartイベントを送信
  useEffect(() => {
    if (!isLoading && visiblePlans.length > 0) {
      const recommendedPlan =
        visiblePlans.find((p) => p.badge === 'recommended') || visiblePlans[0]
      if (recommendedPlan) {
        trackMetaAddToCart(
          recommendedPlan.price,
          'JPY',
          recommendedPlan.name,
          [recommendedPlan.id]
        )
      }
    }
  }, [isLoading, visiblePlans])

  // 初回限定プランがある場合、適切な位置にスクロール
  useEffect(() => {
    if (!isLoading && isFirstPurchase && firstTimePlan && firstTimePlanRef.current) {
      // 少し遅延させてDOMのレンダリング完了を待つ
      setTimeout(() => {
        const element = firstTimePlanRef.current
        if (element) {
          const rect = element.getBoundingClientRect()
          const elementTop = window.pageYOffset + rect.top
          // スクロール位置を調整
          const offset = window.innerHeight * -0.02
          window.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth',
          })
        }
      }, 100)
    }
  }, [isLoading, isFirstPurchase, firstTimePlan])

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice

    if (appliedCoupon.discount_type === 'percentage') {
      const discount = Math.round(
        (originalPrice * appliedCoupon.discount_value) / 100
      )
      return Math.max(0, originalPrice - discount)
    } else {
      return Math.max(0, originalPrice - appliedCoupon.discount_value)
    }
  }

  const calculateDiscount = (originalPrice: number) => {
    if (!appliedCoupon) return 0

    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round((originalPrice * appliedCoupon.discount_value) / 100)
    } else {
      return appliedCoupon.discount_value
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-spiritual-gold/30 border-t-spiritual-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-base md:text-lg drop-shadow-md">
            プランを読み込み中...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* 初回限定プラン - 派手なバナー */}
      {isFirstPurchase && firstTimePlan && (
        <div ref={firstTimePlanRef} className="mb-8 relative">
          {/* 背景のキラキラエフェクト */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-0 right-1/4 w-40 h-40 bg-pink-500/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '0.5s' }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
          </div>

          <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-1 shadow-2xl shadow-orange-500/30">
            <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-[22px] p-6 md:p-8">
              {/* 限定バッジ */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm md:text-base animate-bounce shadow-lg">
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">🎉 初回限定！特別割引価格 🎉</span>
                  <Sparkles className="w-5 h-5 flex-shrink-0" />
                </div>
              </div>

              {/* メインコンテンツ */}
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {firstTimePlan.name}
                </h2>
                <p className="text-gray-300 mb-6 whitespace-nowrap">
                  {firstTimePlan.description}
                </p>

                {/* ポイント数 */}
                <div className="mb-4">
                  <p className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {firstTimePlan.points.toLocaleString()}
                    <span className="text-2xl md:text-3xl text-yellow-400">
                      pt
                    </span>
                  </p>
                </div>

                {/* 価格表示 - 取り消し線付き */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="relative">
                    <p className="text-2xl md:text-3xl text-gray-400 line-through decoration-red-500 decoration-2">
                      ¥{firstTimePlan.regularPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-3xl md:text-4xl text-white">→</div>
                  <div className="relative">
                    <p className="text-4xl md:text-5xl font-bold text-white">
                      ¥{firstTimePlan.price.toLocaleString()}
                    </p>
                    <div className="absolute -top-2 -right-12 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full transform rotate-12">
                      {firstTimePlan.discountRate}%OFF
                    </div>
                  </div>
                </div>

                {/* お得ポイント */}
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white text-sm">
                      {firstTimePlan.regularPrice - firstTimePlan.price}円お得
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Gift className="w-5 h-5 text-pink-400" />
                    <span className="text-white text-sm">
                      鑑定1回分がたった100円
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 text-orange-400" />
                    <span className="text-white text-sm">
                      今だけの特別価格
                    </span>
                  </div>
                </div>

                {/* 購入ボタン */}
                <div className="max-w-xs mx-auto">
                  <PurchaseButton
                    planId={firstTimePlan.id}
                    label="🎁 今すぐ特別価格で購入"
                    couponCode={appliedCoupon?.code}
                    className="w-full bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 hover:from-yellow-400 hover:via-orange-400 hover:to-pink-400 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg shadow-orange-500/50 transform hover:scale-105 transition-all duration-200"
                  />
                </div>

                {/* 注意書き */}
                <p className="text-gray-400 text-xs mt-4">
                  ※ 初回購入の方限定。おひとり様1回限り。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 通常プラン一覧のタイトル */}
      {isFirstPurchase && firstTimePlan && (
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">その他のプラン</h3>
          <p className="text-gray-400 text-sm">
            まとめ買いでさらにお得！
          </p>
        </div>
      )}

      {/* プラン一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {visiblePlans.map((plan) => {
          const badgeLabel = getBadgeLabel(plan.badge)
          const savings = plan.regularPrice - plan.price
          const discountedPrice = calculateDiscountedPrice(plan.price)
          const couponDiscount = calculateDiscount(plan.price)
          const totalSavings = savings + couponDiscount

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl ${
                plan.badge === 'recommended'
                  ? 'border-2 border-purple-500 scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {/* バッジ */}
              {badgeLabel && (
                <div
                  className={`absolute -top-3 -right-3 px-4 py-1 rounded-full text-sm font-bold text-white shadow-md ${
                    plan.badge === 'recommended'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                      : plan.badge === 'popular'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  }`}
                >
                  {badgeLabel}
                </div>
              )}

              {/* プラン名 */}
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>

              {/* ポイント数 */}
              <div className="mb-4">
                <p className="text-4xl font-bold text-purple-600">
                  {plan.points.toLocaleString()}
                  <span className="text-lg text-gray-600">pt</span>
                </p>
              </div>

              {/* 価格 */}
              <div className="mb-4">
                {plan.discountRate > 0 || appliedCoupon ? (
                  <div>
                    <p className="text-sm text-gray-500 line-through">
                      ¥{plan.regularPrice.toLocaleString()}
                    </p>
                    {appliedCoupon && (
                      <p className="text-sm text-purple-600 line-through">
                        ¥{plan.price.toLocaleString()}
                      </p>
                    )}
                    <p className="text-3xl font-bold text-gray-900">
                      ¥{discountedPrice.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      {totalSavings.toLocaleString()}円お得！
                    </p>
                  </div>
                ) : (
                  <p className="text-3xl font-bold text-gray-900">
                    ¥{plan.price.toLocaleString()}
                  </p>
                )}
              </div>

              {/* 説明 */}
              {plan.description && (
                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
              )}

              {/* 特徴リスト */}
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>即座にポイント付与</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>有効期限なし</span>
                </li>
                {plan.discountRate > 0 && (
                  <li className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500" />
                    <span>{plan.discountRate}%割引</span>
                  </li>
                )}
                {appliedCoupon && (
                  <li className="flex items-center gap-2 text-sm text-purple-700">
                    <Check className="w-4 h-4 text-purple-500" />
                    <span>
                      クーポン割引:
                      {appliedCoupon.discount_type === 'percentage'
                        ? ` ${appliedCoupon.discount_value}%`
                        : ` ${appliedCoupon.discount_value}円`}
                    </span>
                  </li>
                )}
              </ul>

              {/* 購入ボタン */}
              <PurchaseButton
                planId={plan.id}
                label="購入する"
                couponCode={appliedCoupon?.code}
              />
            </div>
          )
        })}
      </div>

      {/* クーポンコード入力 */}
      <div className="mt-8">
        <CouponInput onCouponApplied={setAppliedCoupon} />
      </div>
    </>
  )
}
