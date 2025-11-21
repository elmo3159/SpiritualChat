import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ログイン｜スピチャ - 24時間365日いつでもAI占い',
  description: 'スピチャにログインして、人気占い師監修のAI占いをご利用ください。恋愛・仕事・人間関係の悩みを24時間365日、いつでもどこでも気軽に相談できます。',
  keywords: 'ログイン, AI占い, オンライン占い, 恋愛占い, 仕事運, チャット占い',
  openGraph: {
    title: 'ログイン｜スピチャ - 24時間365日いつでもAI占い',
    description: '人気占い師監修のAI占いでいつでも気軽に相談。ログインして今すぐ占いを始めましょう。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ログイン｜スピチャ - 24時間365日いつでもAI占い',
    description: '人気占い師監修のAI占いでいつでも気軽に相談。ログインして今すぐ占いを始めましょう。',
  },
  alternates: {
    canonical: '/login',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
