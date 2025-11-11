/**
 * Google Analytics イベントトラッキングヘルパー
 *
 * カスタムイベントを送信するためのユーティリティ関数
 */

// グローバルなgtagの型定義
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
  }
}

/**
 * ページビューイベントを送信
 */
export const trackPageView = (url: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: url,
    })
  }
}

/**
 * 鑑定開始イベントを送信
 */
export const trackDivinationStart = (fortuneTellerId: string, fortuneTellerName: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'divination_start', {
      event_category: 'engagement',
      event_label: fortuneTellerName,
      fortune_teller_id: fortuneTellerId,
    })
  }
}

/**
 * 鑑定結果開封イベントを送信
 */
export const trackDivinationOpen = (
  fortuneTellerId: string,
  fortuneTellerName: string,
  pointsCost: number
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'divination_open', {
      event_category: 'conversion',
      event_label: fortuneTellerName,
      fortune_teller_id: fortuneTellerId,
      value: pointsCost,
      currency: 'JPY',
    })
  }
}

/**
 * ポイント購入開始イベントを送信
 */
export const trackPointsPurchaseStart = () => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'begin_checkout', {
      event_category: 'ecommerce',
    })
  }
}

/**
 * ポイント購入完了イベントを送信
 */
export const trackPointsPurchaseComplete = (amount: number, points: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'purchase', {
      event_category: 'ecommerce',
      transaction_id: `${Date.now()}`,
      value: amount,
      currency: 'JPY',
      items: [
        {
          item_id: 'points',
          item_name: `${points}ポイント`,
          quantity: points,
          price: amount / points,
        },
      ],
    })
  }
}

/**
 * クーポン使用イベントを送信
 */
export const trackCouponUsed = (couponCode: string, bonusPoints: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'coupon_used', {
      event_category: 'engagement',
      event_label: couponCode,
      value: bonusPoints,
    })
  }
}

/**
 * レビュー投稿イベントを送信
 */
export const trackReviewSubmit = (fortuneTellerId: string, rating: number) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'review_submit', {
      event_category: 'engagement',
      fortune_teller_id: fortuneTellerId,
      rating: rating,
    })
  }
}

/**
 * フィードバック送信イベントを送信
 */
export const trackFeedbackSubmit = (type: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'feedback_submit', {
      event_category: 'engagement',
      feedback_type: type,
    })
  }
}

/**
 * ユーザー登録完了イベントを送信
 */
export const trackUserSignUp = (method: 'email' | 'google') => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'sign_up', {
      event_category: 'engagement',
      method: method,
    })
  }
}

/**
 * プロフィール登録完了イベントを送信
 */
export const trackProfileComplete = () => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'profile_complete', {
      event_category: 'engagement',
    })
  }
}

/**
 * チャットメッセージ送信イベントを送信
 */
export const trackChatMessage = (fortuneTellerId: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'chat_message', {
      event_category: 'engagement',
      fortune_teller_id: fortuneTellerId,
    })
  }
}

/**
 * お気に入り追加イベントを送信
 */
export const trackAddFavorite = (fortuneTellerId: string, fortuneTellerName: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'add_to_favorites', {
      event_category: 'engagement',
      event_label: fortuneTellerName,
      fortune_teller_id: fortuneTellerId,
    })
  }
}

/**
 * 検索イベントを送信
 */
export const trackSearch = (searchTerm: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'search', {
      event_category: 'engagement',
      search_term: searchTerm,
    })
  }
}
