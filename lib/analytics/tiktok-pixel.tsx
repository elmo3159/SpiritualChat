'use client'

import Script from 'next/script'

/**
 * TikTok Pixelベースコード
 * すべてのページで読み込まれ、基本的なページビュー計測を行います
 */
export default function TikTokPixel() {
  const pixelId = 'D4DJHL3C77UBVM8P9LFG'

  return (
    <>
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(
              var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script")
              ;n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};

              ttq.load('${pixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `,
        }}
      />
    </>
  )
}

/**
 * SHA-256ハッシュを生成（TikTok Pixel用）
 * メールアドレスや外部IDをハッシュ化してプライバシーを保護します
 */
const sha256 = async (message: string): Promise<string> => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

/**
 * TikTokイベントをトラッキングするヘルパー関数
 */
export const trackTikTokEvent = (
  eventName: string,
  eventProperties?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    ;(window as any).ttq.track(eventName, eventProperties)
  }
}

/**
 * TikTok Pixel identify - ユーザー識別情報を送信
 * @param email ユーザーのメールアドレス（SHA-256でハッシュ化されます）
 * @param externalId 外部ID（SupabaseのユーザーIDなど、SHA-256でハッシュ化されます）
 */
export const trackTikTokIdentify = async (
  email: string,
  externalId?: string
) => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    try {
      // メールアドレスを小文字に変換してトリムしてからハッシュ化
      const hashedEmail = await sha256(email.toLowerCase().trim())
      const identifyData: Record<string, string> = {
        email: hashedEmail,
      }

      // 外部IDが提供されている場合はハッシュ化して追加
      if (externalId) {
        const hashedExternalId = await sha256(externalId)
        identifyData.external_id = hashedExternalId
      }

      console.log('TikTok Pixel: identify イベント送信 (email & external_id hashed)')

      // TikTok Pixelにユーザー識別情報を送信
      ;(window as any).ttq.identify(identifyData)
    } catch (error) {
      console.error('TikTok identify error:', error)
    }
  } else {
    console.warn('TikTok Pixel: ttqオブジェクトが見つかりません (identify)')
  }
}

/**
 * 会員登録完了イベント
 */
export const trackCompleteRegistration = () => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    console.log('TikTok Pixel: CompleteRegistration イベント送信')
    trackTikTokEvent('CompleteRegistration')
  } else {
    console.warn('TikTok Pixel: ttqオブジェクトが見つかりません')
  }
}

/**
 * 購入完了イベント
 * @param value 購入金額（日本円）
 * @param currency 通貨コード（デフォルト: JPY）
 */
export const trackPurchase = (value: number, currency: string = 'JPY') => {
  if (typeof window !== 'undefined' && (window as any).ttq) {
    console.log(`TikTok Pixel: Purchase イベント送信 (金額: ${value} ${currency})`)
    trackTikTokEvent('Purchase', {
      value,
      currency,
    })
  } else {
    console.warn('TikTok Pixel: ttqオブジェクトが見つかりません')
  }
}
