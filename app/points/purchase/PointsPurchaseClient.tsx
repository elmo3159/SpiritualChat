'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'
import { POINT_PLANS, getBadgeLabel, PointPlan } from '@/lib/data/point-plans'
import PurchaseButton from '@/app/components/points/PurchaseButton'
import CouponInput from '@/app/components/points/CouponInput'

interface CouponData {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
}

export default function PointsPurchaseClient() {
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [visiblePlans, setVisiblePlans] = useState<PointPlan[]>(POINT_PLANS)

  // 設定を取得してプランをフィルタリング
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings')
        const data = await res.json()

        // テストプランの表示/非表示を制御
        if (data.enable_test_plan === false) {
          setVisiblePlans(
            POINT_PLANS.filter((plan) => plan.id !== 'plan-test-100')
          )
        } else {
          setVisiblePlans(POINT_PLANS)
        }
      } catch (error) {
        console.error('設定取得エラー:', error)
        // エラー時は全プランを表示
        setVisiblePlans(POINT_PLANS)
      }
    }

    fetchSettings()
  }, [])

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice

    if (appliedCoupon.discount_type === 'percentage') {
      const discount = Math.round((originalPrice * appliedCoupon.discount_value) / 100)
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

  return (
    <>
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
                <p className="text-sm text-gray-600 mb-4">
                  {plan.description}
                </p>
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
