import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー｜スピチャ - 個人情報保護方針',
  description: 'スピチャのプライバシーポリシー。お客様の個人情報の取り扱いについて詳しく説明しています。情報の収集・利用目的、第三者提供、セキュリティ対策などをご確認ください。',
  keywords: 'プライバシーポリシー, 個人情報保護, 情報セキュリティ, データ保護, AI占い',
  openGraph: {
    title: 'プライバシーポリシー｜スピチャ - 個人情報保護方針',
    description: 'お客様の個人情報の取り扱いについて詳しく説明しています。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary',
    title: 'プライバシーポリシー｜スピチャ - 個人情報保護方針',
    description: 'お客様の個人情報の取り扱いについて詳しく説明しています。',
  },
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
