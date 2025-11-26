'use client'

import Script from 'next/script'

/**
 * Meta (Facebook/Instagram) Pixelベースコード
 * すべてのページで読み込まれ、基本的なページビュー計測を行います
 */
export default function MetaPixel() {
  const pixelId = '1385360049887148'

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      {/* noscript fallback for users with JavaScript disabled */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

/**
 * Meta Pixelイベントをトラッキングするヘルパー関数
 * @param eventName イベント名
 * @param eventProperties イベントプロパティ
 */
export const trackMetaEvent = (
  eventName: string,
  eventProperties?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (eventProperties) {
      ;(window as any).fbq('track', eventName, eventProperties)
    } else {
      ;(window as any).fbq('track', eventName)
    }
  }
}

/**
 * カスタムイベントをトラッキング（標準イベント以外）
 * @param eventName カスタムイベント名
 * @param eventProperties イベントプロパティ
 */
export const trackMetaCustomEvent = (
  eventName: string,
  eventProperties?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    if (eventProperties) {
      ;(window as any).fbq('trackCustom', eventName, eventProperties)
    } else {
      ;(window as any).fbq('trackCustom', eventName)
    }
  }
}

/**
 * 会員登録完了イベント（プロフィール登録完了時）
 * Meta標準イベント: CompleteRegistration
 */
export const trackMetaCompleteRegistration = (value?: number, currency: string = 'JPY') => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log('Meta Pixel: CompleteRegistration イベント送信')
    const params: Record<string, unknown> = {}
    if (value !== undefined) {
      params.value = value
      params.currency = currency
    }
    trackMetaEvent('CompleteRegistration', Object.keys(params).length > 0 ? params : undefined)
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (CompleteRegistration)')
  }
}

/**
 * 購入完了イベント
 * Meta標準イベント: Purchase
 * @param value 購入金額（日本円）
 * @param currency 通貨コード（デフォルト: JPY）
 * @param contentIds 商品ID（オプション）
 * @param contentName 商品名（オプション）
 */
export const trackMetaPurchase = (
  value: number,
  currency: string = 'JPY',
  contentIds?: string[],
  contentName?: string
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log(`Meta Pixel: Purchase イベント送信 (金額: ${value} ${currency})`)
    const params: Record<string, unknown> = {
      value,
      currency,
    }
    if (contentIds) {
      params.content_ids = contentIds
    }
    if (contentName) {
      params.content_name = contentName
    }
    trackMetaEvent('Purchase', params)
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (Purchase)')
  }
}

/**
 * リード獲得イベント（アカウント作成時など）
 * Meta標準イベント: Lead
 */
export const trackMetaLead = (value?: number, currency: string = 'JPY') => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log('Meta Pixel: Lead イベント送信')
    const params: Record<string, unknown> = {}
    if (value !== undefined) {
      params.value = value
      params.currency = currency
    }
    trackMetaEvent('Lead', Object.keys(params).length > 0 ? params : undefined)
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (Lead)')
  }
}

/**
 * コンテンツ閲覧イベント（占い師ページ閲覧など）
 * Meta標準イベント: ViewContent
 * @param contentName コンテンツ名
 * @param contentCategory カテゴリ
 * @param contentIds コンテンツID
 * @param value 価値
 */
export const trackMetaViewContent = (
  contentName?: string,
  contentCategory?: string,
  contentIds?: string[],
  value?: number
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log('Meta Pixel: ViewContent イベント送信')
    const params: Record<string, unknown> = {}
    if (contentName) params.content_name = contentName
    if (contentCategory) params.content_category = contentCategory
    if (contentIds) params.content_ids = contentIds
    if (value !== undefined) {
      params.value = value
      params.currency = 'JPY'
    }
    trackMetaEvent('ViewContent', Object.keys(params).length > 0 ? params : undefined)
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (ViewContent)')
  }
}

/**
 * カート追加イベント（ポイント購入画面表示時など）
 * Meta標準イベント: AddToCart
 * @param value 金額
 * @param currency 通貨
 * @param contentName 商品名
 * @param contentIds 商品ID
 */
export const trackMetaAddToCart = (
  value: number,
  currency: string = 'JPY',
  contentName?: string,
  contentIds?: string[]
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log(`Meta Pixel: AddToCart イベント送信 (金額: ${value} ${currency})`)
    const params: Record<string, unknown> = {
      value,
      currency,
    }
    if (contentName) params.content_name = contentName
    if (contentIds) params.content_ids = contentIds
    trackMetaEvent('AddToCart', params)
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (AddToCart)')
  }
}

/**
 * チェックアウト開始イベント
 * Meta標準イベント: InitiateCheckout
 * @param value 金額
 * @param currency 通貨
 * @param numItems 商品数
 */
export const trackMetaInitiateCheckout = (
  value: number,
  currency: string = 'JPY',
  numItems?: number
) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log(`Meta Pixel: InitiateCheckout イベント送信 (金額: ${value} ${currency})`)
    const params: Record<string, unknown> = {
      value,
      currency,
    }
    if (numItems !== undefined) params.num_items = numItems
    trackMetaEvent('InitiateCheckout', params)
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (InitiateCheckout)')
  }
}

/**
 * 検索イベント
 * Meta標準イベント: Search
 * @param searchString 検索文字列
 */
export const trackMetaSearch = (searchString: string) => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log(`Meta Pixel: Search イベント送信 (検索: ${searchString})`)
    trackMetaEvent('Search', { search_string: searchString })
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (Search)')
  }
}

/**
 * お問い合わせイベント
 * Meta標準イベント: Contact
 */
export const trackMetaContact = () => {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    console.log('Meta Pixel: Contact イベント送信')
    trackMetaEvent('Contact')
  } else {
    console.warn('Meta Pixel: fbqオブジェクトが見つかりません (Contact)')
  }
}
