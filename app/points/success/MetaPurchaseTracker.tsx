'use client'

import { useEffect } from 'react'
import { trackMetaPurchase } from '@/lib/analytics/meta-pixel'

interface MetaPurchaseTrackerProps {
  /** 購入金額（日本円） */
  amount: number
  /** 購入したポイント数 */
  points?: number
  /** プランID */
  planId?: string
}

/**
 * Meta購入完了イベントトラッカー
 *
 * ポイント購入成功時にMeta Pixelの購入イベントを送信します
 */
export default function MetaPurchaseTracker({
  amount,
  points,
  planId,
}: MetaPurchaseTrackerProps) {
  useEffect(() => {
    // 購入金額が0より大きい場合のみイベントを送信
    if (amount > 0) {
      trackMetaPurchase(
        amount,
        'JPY',
        planId ? [planId] : undefined,
        points ? `${points}ポイント` : undefined
      )
    }
  }, [amount, points, planId])

  return null
}
