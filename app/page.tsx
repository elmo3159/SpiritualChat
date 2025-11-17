'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, MessageCircle, Clock, Heart, Shield, Star, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // ログイン済みユーザーは占い師一覧ページにリダイレクト
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        router.replace('/fortune-tellers')
      }
    }
    checkAuth()
  }, [router])

  const features = [
    {
      icon: <Star className="w-8 h-8" />,
      title: '人気占い師監修',
      description: '実績ある占い師が監修したAI占いで本格鑑定',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24時間365日対応',
      description: 'いつでもあなたの悩みに寄り添います',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: '匿名で安心',
      description: '人には言えない悩みも気軽に相談できます',
    },
  ]

  const consultationCases = [
    '復縁したい',
    '好きな人と付き合いたい',
    '最近相手が冷たい',
    '既婚者に恋をしてしまった',
    '既婚者だけど恋をしてしまった',
    '仕事運を占いたい',
    '彼にブロックされてる',
    '今日の運勢を詳しく知りたい',
  ]

  const testimonials = [
    {
      text: '心が本当に軽くなりました。誰にも相談できなかった悩みを聞いてもらえて、前向きになれました。',
      name: 'M.K様（28歳）',
      category: '恋愛',
    },
    {
      text: '本当に連絡が来た！占いで言われた通りの日に連絡があって、今は復縁できました。',
      name: 'A.S様（32歳）',
      category: '復縁',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-dark via-[#1a1a2e] to-spiritual-dark text-white">
      {/* ヘッダー */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 pt-safe-top ${
          isScrolled
            ? 'bg-spiritual-dark/95 backdrop-blur-lg border-b border-spiritual-gold/20'
            : 'bg-spiritual-dark/50 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="スピチャ"
              width={160}
              height={56}
              className="w-auto h-9 md:h-11"
              priority
            />
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 md:px-6 py-2 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-full font-bold text-sm md:text-base text-spiritual-dark hover:scale-105 transition-transform duration-300 shadow-lg shadow-spiritual-gold/30"
          >
            ログイン
          </button>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative pt-20 md:pt-24 pb-12 px-4 overflow-hidden">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-5 w-48 h-48 md:w-72 md:h-72 bg-spiritual-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-5 w-64 h-64 md:w-96 md:h-96 bg-spiritual-gold/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* 無料バッジ */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-spiritual-accent to-spiritual-gold blur-xl opacity-50 animate-pulse"></div>
              <div className="relative px-8 py-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-full">
                <p className="text-spiritual-dark font-bold text-lg md:text-2xl whitespace-nowrap">
                  ✨ 1回無料で占える ✨
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-6">
            {/* メインキャッチコピー */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight px-4">
              <span className="block text-white mb-2">あなたの悩み、</span>
              <span className="block bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent">
                今すぐ占います
              </span>
            </h2>

            <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              人気占い師監修のAI占いで24時間365日、いつでも本格鑑定
            </p>

            {/* 占い師画像 */}
            <div className="flex justify-center gap-3 md:gap-4 py-4">
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-spiritual-gold/50 shadow-lg shadow-spiritual-gold/30">
                <Image
                  src="/images/Generated Image November 08, 2025 - 10_28AM.png"
                  alt="占い師"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-spiritual-gold/50 shadow-lg shadow-spiritual-gold/30">
                <Image
                  src="/images/Generated Image November 09, 2025 - 12_42P.png"
                  alt="占い師"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-3 border-spiritual-gold/50 shadow-lg shadow-spiritual-gold/30">
                <Image
                  src="/images/Generated Image November 09, 2025 -a1_43AM.png"
                  alt="占い師"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* CTAボタン */}
            <div className="pt-4">
              <button
                onClick={() => router.push('/login')}
                className="group relative w-full max-w-md mx-auto px-8 py-4 md:py-5 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl font-bold text-base md:text-lg text-spiritual-dark shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 active:scale-95 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6" />
                  今すぐ無料で占う
                </span>
              </button>
              <p className="text-xs md:text-sm text-gray-400 mt-3">
                ※ 新規登録で1000ポイントプレゼント
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              スピチャが選ばれる理由
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 md:p-8 text-center"
              >
                <div className="text-spiritual-gold mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-lg md:text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 相談事例とお客様の声を統合 */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          {/* 相談事例 */}
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              こんなお悩み、ありませんか？
            </span>
          </h3>
          <p className="text-center text-gray-300 mb-8 text-sm md:text-base">
            人には言えない悩みも、スピチャなら安心して相談できます
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-12">
            {consultationCases.slice(0, 8).map((caseText, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-3 md:p-4 text-center"
              >
                <p className="text-white text-xs md:text-sm font-medium">{caseText}</p>
              </div>
            ))}
          </div>

          {/* お客様の声 */}
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-6 mt-12 md:mt-16">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              お客様の声
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 md:p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-spiritual-gold flex-shrink-0">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                    {'"'}{testimonial.text}{'"'}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10">
                  <p className="text-xs md:text-sm text-gray-400">{testimonial.name}</p>
                  <span className="px-2 md:px-3 py-1 bg-spiritual-gold/20 border border-spiritual-gold/30 rounded-full text-xs text-spiritual-gold">
                    {testimonial.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-12 md:py-16 px-4 pb-24 md:pb-16">
        <div className="container mx-auto max-w-4xl">
          <div className="backdrop-blur-lg bg-gradient-to-br from-spiritual-accent/20 to-spiritual-gold/20 border border-spiritual-gold/30 rounded-2xl md:rounded-3xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
              今すぐ悩みを解決しませんか？
            </h3>
            <p className="text-base md:text-xl text-gray-200 mb-6 md:mb-8">
              新規登録で1000ポイントプレゼント
            </p>
            <button
              onClick={() => router.push('/login')}
              className="group relative w-full md:w-auto px-10 md:px-12 py-4 md:py-6 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl font-bold text-base md:text-xl text-spiritual-dark shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 active:scale-95 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-2 md:gap-3 justify-center">
                <Sparkles className="w-5 h-5 md:w-7 md:h-7" />
                無料で今すぐ始める
                <Sparkles className="w-5 h-5 md:w-7 md:h-7" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* モバイル固定CTAボタン */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
        <div className="bg-spiritual-dark/95 backdrop-blur-lg border-t border-spiritual-gold/30 p-4">
          <button
            onClick={() => router.push('/login')}
            className="w-full py-4 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent rounded-xl font-bold text-base text-spiritual-dark shadow-2xl shadow-spiritual-gold/50 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            今すぐ無料で占う
          </button>
        </div>
      </div>

      {/* フッター */}
      <footer className="py-8 md:py-12 px-4 border-t border-white/10 bg-spiritual-dark/80 mb-20 md:mb-0">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            {/* ブランド */}
            <div className="text-center md:text-left">
              <Image
                src="/images/logo.png"
                alt="スピチャ"
                width={140}
                height={49}
                className="w-auto h-8 mx-auto md:mx-0 mb-2"
              />
              <p className="text-xs text-gray-400">
                24時間365日、あなたの悩みに寄り添うAI占いサービス
              </p>
            </div>

            {/* リンク */}
            <div className="flex gap-8 text-center">
              <div>
                <h5 className="font-bold mb-2 text-sm">サービス</h5>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>
                    <a href="/login" className="hover:text-spiritual-gold transition-colors">
                      ログイン
                    </a>
                  </li>
                  <li>
                    <a href="/login" className="hover:text-spiritual-gold transition-colors">
                      新規登録
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h5 className="font-bold mb-2 text-sm">法的情報</h5>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>
                    <a href="/terms" className="hover:text-spiritual-gold transition-colors">
                      利用規約
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="hover:text-spiritual-gold transition-colors">
                      プライバシー
                    </a>
                  </li>
                  <li>
                    <a href="/legal/tokusho" className="hover:text-spiritual-gold transition-colors">
                      特定商取引法
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-center text-xs text-gray-400">
            <p>&copy; 2025 スピチャ (SpiritualChat). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
