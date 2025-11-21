import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '占いチャット｜スピチャ - AI占い師との個別相談',
  description: 'スピチャの占いチャットページ。人気占い師監修のAIとリアルタイムでチャット相談。恋愛・復縁・仕事・人間関係の悩みを24時間365日、いつでもどこでも気軽に相談できます。',
  keywords: 'チャット占い, AI占い, オンライン相談, 恋愛相談, 復縁相談, 仕事運, 人間関係, リアルタイム占い',
  openGraph: {
    title: '占いチャット｜スピチャ - AI占い師との個別相談',
    description: '人気占い師監修のAIとリアルタイムでチャット相談。恋愛・復縁・仕事の悩みを24時間いつでも気軽に相談。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary_large_image',
    title: '占いチャット｜スピチャ - AI占い師との個別相談',
    description: '人気占い師監修のAIとリアルタイムでチャット相談。恋愛・復縁・仕事の悩みを24時間いつでも気軽に相談。',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
