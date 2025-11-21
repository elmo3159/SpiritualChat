import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '占い師一覧｜スピチャ - 人気AI占い師があなたの悩みを解決',
  description: 'スピチャの占い師一覧ページ。恋愛・復縁・仕事・金運など、あなたの悩みに合わせた専門占い師を選べます。24時間365日、いつでもチャットで気軽に相談できるAI占いサービス。',
  keywords: '占い師一覧, AI占い師, 恋愛占い, 復縁占い, 仕事運, 金運, 人気占い師, オンライン占い, チャット占い',
  openGraph: {
    title: '占い師一覧｜スピチャ - 人気AI占い師があなたの悩みを解決',
    description: '恋愛・復縁・仕事・金運など、あなたの悩みに合わせた専門占い師を選べます。24時間いつでもチャットで気軽に相談。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary_large_image',
    title: '占い師一覧｜スピチャ - 人気AI占い師があなたの悩みを解決',
    description: '恋愛・復縁・仕事・金運など、あなたの悩みに合わせた専門占い師を選べます。24時間いつでもチャットで気軽に相談。',
  },
  alternates: {
    canonical: '/fortune-tellers',
  },
}

export default function FortuneTellersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
