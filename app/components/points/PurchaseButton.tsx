'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/checkout'
import { Loader2 } from 'lucide-react'

interface Props {
  /**
   * プランID
   */
  planId: string

  /**
   * ボタンテキスト
   */
  label?: string

  /**
   * カスタムクラス名
   */
  className?: string

  /**
   * クーポンコード（オプション）
   */
  couponCode?: string
}

/**
 * ポイント購入ボタンコンポーネント
 *
 * クリックするとStripe Checkoutページにリダイレクトします
 */
export default function PurchaseButton({
  planId,
  label = '購入する',
  className = '',
  couponCode,
}: Props) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePurchase = async () => {
    setIsPending(true)
    setError(null)

    try {
      const { url } = await createCheckoutSession(planId, couponCode)
      // Stripe Checkoutページにリダイレクト
      window.location.href = url
    } catch (err: any) {
      console.error('購入エラー:', err)
      setError(err.message || '購入処理に失敗しました')
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePurchase}
        disabled={isPending}
        className={`w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>処理中...</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>

      {error && (
        <div className="px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}
    </div>
  )
}
