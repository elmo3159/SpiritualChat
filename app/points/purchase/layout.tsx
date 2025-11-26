import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ポイント購入｜スピチャ - お得な料金プランで占い放題',
  description: 'スピチャのポイント購入ページ。まとめ買いでお得！480円から気軽に始められます。クレジットカード決済で即時反映。キャンペーン中は最大20%ボーナスポイント付与。',
  keywords: 'ポイント購入, 料金, 価格, 決済, クレジットカード, お得, キャンペーン, AI占い',
  openGraph: {
    title: 'ポイント購入｜スピチャ - お得な料金プランで占い放題',
    description: 'まとめ買いでお得！キャンペーン中は最大20%ボーナスポイント。安全なクレジットカード決済で即時反映。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ポイント購入｜スピチャ - お得な料金プランで占い放題',
    description: 'まとめ買いでお得！キャンペーン中は最大20%ボーナスポイント。安全なクレジットカード決済で即時反映。',
  },
  alternates: {
    canonical: '/points/purchase',
  },
}

export default function PointsPurchaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
