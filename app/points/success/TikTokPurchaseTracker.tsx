'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/lib/analytics/tiktok-pixel'

interface TikTokPurchaseTrackerProps {
  /** 購入金額（日本円） */
  amount: number
}

/**
 * TikTok購入完了イベントトラッカー
 *
 * ポイント購入成功時にTikTok Pixelの購入イベントを送信します
 */
export default function TikTokPurchaseTracker({
  amount,
}: TikTokPurchaseTrackerProps) {
  useEffect(() => {
    // 購入金額が0より大きい場合のみイベントを送信
    if (amount > 0) {
      trackPurchase(amount, 'JPY')
    }
  }, [amount])

  return null
}
