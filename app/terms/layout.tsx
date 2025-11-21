import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '利用規約｜スピチャ - AI占いサービス利用規約',
  description: 'スピチャの利用規約ページ。AI占いサービスをご利用いただく際の規約を掲載しています。サービス内容、ポイント制度、禁止事項、免責事項などをご確認ください。',
  keywords: '利用規約, 規約, AI占い, サービス規約, ポイント制度, 禁止事項',
  openGraph: {
    title: '利用規約｜スピチャ - AI占いサービス利用規約',
    description: 'AI占いサービスをご利用いただく際の規約を掲載しています。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary',
    title: '利用規約｜スピチャ - AI占いサービス利用規約',
    description: 'AI占いサービスをご利用いただく際の規約を掲載しています。',
  },
  alternates: {
    canonical: '/terms',
  },
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
