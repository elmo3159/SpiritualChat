'use client'

import Script from 'next/script'

interface GoogleAnalyticsProps {
  /**
   * Google Analytics測定ID (G-XXXXXXXXXX)
   */
  measurementId: string
}

/**
 * Google Analytics 4コンポーネント
 *
 * アプリケーションのルートレイアウトに配置して使用します
 */
export default function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}
