'use client'

import { useState } from 'react'
import { Tag, Loader2, CheckCircle, XCircle, X } from 'lucide-react'

interface CouponData {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
}

interface Props {
  onCouponApplied?: (coupon: CouponData | null) => void
}

/**
 * クーポンコード入力コンポーネント
 *
 * クーポンコードを入力して検証し、購入時の割引を適用します
 */
export default function CouponInput({ onCouponApplied }: Props) {
  const [couponCode, setCouponCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!couponCode.trim()) {
      setMessage({
        type: 'error',
        text: 'クーポンコードを入力してください',
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: couponCode.trim() }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const coupon = data.coupon
        setAppliedCoupon(coupon)
        setMessage({
          type: 'success',
          text: `クーポン「${coupon.code}」を適用しました！`,
        })

        // 親コンポーネントに通知
        if (onCouponApplied) {
          onCouponApplied(coupon)
        }
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'クーポンの検証に失敗しました',
        })
      }
    } catch (error) {
      console.error('クーポン検証エラー:', error)
      setMessage({
        type: 'error',
        text: 'エラーが発生しました。もう一度お試しください',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode('')
    setMessage(null)

    // 親コンポーネントに通知
    if (onCouponApplied) {
      onCouponApplied(null)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-gray-900">
          クーポンコードをお持ちの方
        </h3>
      </div>

      {appliedCoupon ? (
        // 適用済みクーポン表示
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900">
                  {appliedCoupon.code}
                </p>
                <p className="text-sm text-green-700">
                  {appliedCoupon.discount_type === 'percentage'
                    ? `${appliedCoupon.discount_value}% 割引`
                    : `${appliedCoupon.discount_value}pt 割引`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveCoupon}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="クーポンを削除"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500">
            ※ このクーポンがポイント購入時に適用されます
          </p>
        </div>
      ) : (
        // クーポン入力フォーム
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="クーポンコードを入力"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase font-mono"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !couponCode.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '適用'
              )}
            </button>
          </div>

          {/* メッセージ表示 */}
          {message && (
            <div
              className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              )}
              <p
                className={`text-sm ${
                  message.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <p className="text-xs text-gray-500">
            ※ クーポンコードは大文字・小文字を区別しません
          </p>
        </form>
      )}
    </div>
  )
}
