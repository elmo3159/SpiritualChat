'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
      description: '実績ある占い師が監修したAI占いで、本格的な鑑定を体験',
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'すぐに結果がわかる',
      description: '待ち時間なし。チャット形式で即座に鑑定結果をお届け',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: '誰にも言えない相談も',
      description: '匿名で安心。人には言えない悩みも気軽に相談できます',
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: '具体的なアドバイス',
      description: '時期や行動など、今すぐ実践できる具体的なアドバイス',
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: '多様な占い師',
      description: 'タロット、霊視、数秘術など、様々な占術の占い師が在籍',
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '24時間365日対応',
      description: '深夜でも早朝でも、いつでもあなたの悩みに寄り添います',
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: '優しく寄り添う',
      description: 'いつでもあなたの味方。心が軽くなる温かい言葉をお届け',
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
    {
      text: '仕事の悩みで毎日辛かったけど、具体的なアドバイスで行動できました。転職も成功！',
      name: 'T.H様（35歳）',
      category: '仕事',
    },
    {
      text: '24時間いつでも相談できるのが本当に助かります。夜中に辛くなった時も支えてもらえました。',
      name: 'R.Y様（26歳）',
      category: '人間関係',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-dark via-[#1a1a2e] to-spiritual-dark text-white">
      {/* ヘッダー */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-spiritual-dark/80 backdrop-blur-lg border-b border-spiritual-gold/20'
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-spiritual-gold" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent">
              スピチャ
            </h1>
          </div>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-full font-bold text-spiritual-dark hover:scale-105 transition-transform duration-300 shadow-lg shadow-spiritual-gold/30"
          >
            ログイン / 新規登録
          </button>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-spiritual-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-spiritual-gold/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-8">
            {/* メインキャッチコピー */}
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent animate-gradient">
                  あなたの悩み、
                </span>
                <br />
                <span className="text-white">今すぐ占います</span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
                人気占い師監修のAI占いで
                <br className="md:hidden" />
                24時間365日、いつでも本格鑑定
              </p>
            </div>

            {/* CTAボタン */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
              <button
                onClick={() => router.push('/login')}
                className="group relative px-10 py-5 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl font-bold text-lg text-spiritual-dark shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                <span className="relative flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  無料で始める
                </span>
              </button>
              <p className="text-sm text-gray-400">
                ※ 新規登録で1000ポイントプレゼント
              </p>
            </div>

            {/* グラスモーフィズムカード */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-spiritual-gold/30">
                <div className="text-3xl font-bold text-spiritual-gold mb-2">
                  24h
                </div>
                <div className="text-sm text-gray-300">
                  いつでも相談可能
                </div>
              </div>
              <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-spiritual-gold/30">
                <div className="text-3xl font-bold text-spiritual-gold mb-2">
                  即時
                </div>
                <div className="text-sm text-gray-300">
                  すぐに鑑定結果
                </div>
              </div>
              <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:border-spiritual-gold/30">
                <div className="text-3xl font-bold text-spiritual-gold mb-2">
                  匿名
                </div>
                <div className="text-sm text-gray-300">
                  安心して相談
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-spiritual-dark/50">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-16">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              スピチャが選ばれる理由
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/15 hover:border-spiritual-gold/40 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-spiritual-gold/20"
              >
                <div className="text-spiritual-gold mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 相談事例セクション */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              こんなお悩み、ありませんか？
            </span>
          </h3>
          <p className="text-center text-gray-300 mb-12 text-lg">
            人には言えない悩みも、スピチャなら安心して相談できます
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {consultationCases.map((caseText, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-6 text-center hover:bg-white/15 hover:border-spiritual-gold/40 transition-all duration-300 hover:scale-105 cursor-default"
              >
                <div className="text-spiritual-gold mb-2">
                  <Heart className="w-6 h-6 mx-auto" />
                </div>
                <p className="text-white font-medium">{caseText}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-xl font-bold text-spiritual-dark hover:scale-105 transition-transform duration-300 shadow-lg shadow-spiritual-gold/30"
            >
              今すぐ無料で相談する
            </button>
          </div>
        </div>
      </section>

      {/* お客様の声セクション */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-spiritual-dark/50">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-4xl md:text-5xl font-bold text-center mb-8">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              お客様の声
            </span>
          </h3>
          <p className="text-center text-gray-300 mb-12 text-lg">
            多くの方に喜びの声をいただいています
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/15 hover:border-spiritual-gold/40 transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-spiritual-gold flex-shrink-0">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <p className="text-gray-200 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                </div>
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">{testimonial.name}</p>
                  <span className="px-3 py-1 bg-spiritual-gold/20 border border-spiritual-gold/30 rounded-full text-xs text-spiritual-gold">
                    {testimonial.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="backdrop-blur-lg bg-gradient-to-br from-spiritual-accent/20 to-spiritual-gold/20 border border-spiritual-gold/30 rounded-3xl p-12 text-center">
            <h3 className="text-3xl md:text-5xl font-bold mb-6">
              今すぐ悩みを解決しませんか？
            </h3>
            <p className="text-xl text-gray-200 mb-8">
              新規登録で1000ポイントプレゼント
              <br />
              すぐに本格鑑定を体験できます
            </p>
            <button
              onClick={() => router.push('/login')}
              className="group relative px-12 py-6 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 rounded-2xl font-bold text-xl text-spiritual-dark shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
              <span className="relative flex items-center gap-3 justify-center">
                <Sparkles className="w-7 h-7" />
                無料で今すぐ始める
                <Sparkles className="w-7 h-7" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 px-4 border-t border-white/10 bg-spiritual-dark/80">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* ブランド */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-spiritual-gold" />
                <h4 className="text-xl font-bold">スピチャ</h4>
              </div>
              <p className="text-sm text-gray-400">
                24時間365日、あなたの悩みに寄り添う
                <br />
                AI占いサービス
              </p>
            </div>

            {/* リンク */}
            <div>
              <h5 className="font-bold mb-4">サービス</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="/login"
                    className="hover:text-spiritual-gold transition-colors"
                  >
                    ログイン
                  </a>
                </li>
                <li>
                  <a
                    href="/login"
                    className="hover:text-spiritual-gold transition-colors"
                  >
                    新規登録
                  </a>
                </li>
              </ul>
            </div>

            {/* 法的情報 */}
            <div>
              <h5 className="font-bold mb-4">法的情報</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a
                    href="/terms"
                    className="hover:text-spiritual-gold transition-colors"
                  >
                    利用規約
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="hover:text-spiritual-gold transition-colors"
                  >
                    プライバシーポリシー
                  </a>
                </li>
                <li>
                  <a
                    href="/legal/tokusho"
                    className="hover:text-spiritual-gold transition-colors"
                  >
                    特定商取引法に基づく表記
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>&copy; 2025 スピチャ (SpiritualChat). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
