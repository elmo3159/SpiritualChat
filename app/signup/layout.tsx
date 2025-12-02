import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '新規登録｜スピチャ - 無料で始めるAI占い【登録500ptプレゼント】',
  description: 'スピチャの新規登録で今なら500ポイントプレゼント！人気占い師監修のAI占いで恋愛・復縁・仕事の悩みを24時間いつでも相談。Googleアカウントで簡単登録、匿名で安心。',
  keywords: '新規登録, 会員登録, 無料占い, AI占い, 恋愛相談, 復縁, 仕事運, オンライン占い',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: '新規登録｜スピチャ - 無料で始めるAI占い【登録500ptプレゼント】',
    description: '新規登録で500ポイントプレゼント！人気占い師監修のAI占いをいつでもどこでも。匿名で安心して相談できます。',
    type: 'website',
    siteName: 'スピチャ',
  },
  twitter: {
    card: 'summary_large_image',
    title: '新規登録｜スピチャ - 無料で始めるAI占い【登録500ptプレゼント】',
    description: '新規登録で500ポイントプレゼント！人気占い師監修のAI占いをいつでもどこでも。匿名で安心して相談できます。',
  },
}

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
