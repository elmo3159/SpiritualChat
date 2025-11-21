import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '今日の運勢｜スピチャ - 毎日無料で占える！12星座別AI占い',
  description: 'スピチャの今日の運勢ページ。あなたの星座の今日の運勢を毎日無料で占えます。恋愛運・仕事運・金運・総合運を人気占い師監修のAIが詳しく鑑定。毎朝チェックして素敵な一日を。',
  keywords: '今日の運勢, 星座占い, 無料占い, 毎日占い, 恋愛運, 仕事運, 金運, 12星座, AI占い',
  openGraph: {
    title: '今日の運勢｜スピチャ - 毎日無料で占える！12星座別AI占い',
    description: 'あなたの星座の今日の運勢を毎日無料で占えます。恋愛運・仕事運・金運を人気占い師監修のAIが詳しく鑑定。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary_large_image',
    title: '今日の運勢｜スピチャ - 毎日無料で占える！12星座別AI占い',
    description: 'あなたの星座の今日の運勢を毎日無料で占えます。恋愛運・仕事運・金運を人気占い師監修のAIが詳しく鑑定。',
  },
  alternates: {
    canonical: '/daily-fortune',
  },
}

export default function DailyFortuneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
