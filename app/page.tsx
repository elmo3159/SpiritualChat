'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, MessageCircle, Clock, Heart, Shield, Star, Zap, Users, TrendingUp, Calendar, Award, Lock, CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LandingPage() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

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
      } else {
        setIsCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  const features = [
    {
      icon: <Zap className="w-7 h-7" />,
      title: 'すぐに結果がわかる',
      description: '待ち時間なし。質問したらすぐに本格鑑定結果をお届けします',
    },
    {
      icon: <Clock className="w-7 h-7" />,
      title: '24時間365日対応',
      description: '深夜でも早朝でも、あなたの好きな時間にいつでも占えます',
    },
    {
      icon: <Shield className="w-7 h-7" />,
      title: '人に言えない悩みもOK',
      description: '誰にも知られず、匿名で安心して相談できます',
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: '優しく寄り添ってくれる',
      description: 'いつでもあなたの味方。心が軽くなるまで何度でも',
    },
    {
      icon: <TrendingUp className="w-7 h-7" />,
      title: '時期や行動のアドバイス',
      description: '具体的な時期や取るべき行動を丁寧にアドバイス',
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: '多様な占い師',
      description: '恋愛、仕事、人間関係。あなたに合った占い師が見つかります',
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: '毎日の運勢も詳しく',
      description: '今日の運勢を詳しく占って、最高の一日をスタート',
    },
    {
      icon: <Star className="w-7 h-7" />,
      title: '人気占い師監修',
      description: '実績ある占い師が監修。本格的なAI鑑定を体験',
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
      text: '本当に連絡が来た！占いで言われた通りの日に連絡があって、今は復縁できました。信じてよかったです。',
      name: 'A.S様（32歳）',
      category: '復縁',
    },
    {
      text: '24時間いつでも相談できるのが本当に助かります。仕事で悩んでいた時、深夜に占ってもらって気持ちが楽になりました。',
      name: 'T.Y様（35歳）',
      category: '仕事',
    },
    {
      text: '具体的な時期まで教えてくれたのが驚きでした。その通りになって、今は幸せです。',
      name: 'R.N様（26歳）',
      category: '恋愛',
    },
    {
      text: '人には言えない悩みでしたが、匿名で相談できて本当に安心しました。優しく寄り添ってくれる言葉に救われました。',
      name: 'H.M様（30歳）',
      category: '不倫',
    },
    {
      text: '毎朝その日の運勢を占うのが日課になりました。おかげで毎日ポジティブに過ごせています！',
      name: 'S.K様（24歳）',
      category: '日々の運勢',
    },
  ]

  const securityFeatures = [
    {
      icon: <Lock className="w-6 h-6" />,
      title: 'SSL暗号化通信',
      description: '全ての通信を暗号化し、第三者からの盗聴を防止',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: '個人情報の厳重管理',
      description: 'お客様の情報は安全に保護され、悪用の心配はありません',
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: '安全な決済システム',
      description: 'Stripe社の決済システムで、お支払い情報も安全に保護',
    },
  ]

  // 認証チェック中はローディング画面を表示
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-spiritual-dark via-[#1a1a2e] to-spiritual-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-gold mb-4"></div>
          <p className="text-spiritual-gold">読み込み中...</p>
        </div>
      </div>
    )
  }

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
              src="/images/logo.png?v=2"
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
      <section className="relative pt-16 md:pt-24 pb-8 md:pb-12 px-4 overflow-hidden">
        {/* 背景エフェクト */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-5 w-48 h-48 md:w-72 md:h-72 bg-spiritual-accent/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-5 w-64 h-64 md:w-96 md:h-96 bg-spiritual-gold/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* 無料バッジ */}
          <div className="flex justify-center mb-4 md:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-spiritual-accent to-spiritual-gold blur-xl opacity-50 animate-pulse"></div>
              <div className="relative px-6 py-2 md:px-8 md:py-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-full border-2 border-spiritual-dark/20">
                <p className="text-spiritual-dark font-bold text-base md:text-2xl whitespace-nowrap tracking-wide">
                  無料で占える
                </p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-5 md:space-y-7">
            {/* メインキャッチコピー + LINE風吹き出し */}
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex items-center gap-4 md:gap-8 mb-5 md:mb-7">
                {/* 左側：あなたの悩み、今すぐ占います */}
                <div className="flex-shrink-0">
                  <h2 className="text-2xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-left">
                    <span className="block text-white mb-1 md:mb-2">あなたの悩み、</span>
                    <span className="block bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent whitespace-nowrap">
                      今すぐ占います
                    </span>
                  </h2>
                </div>

                {/* 右側：LINE風吹き出し */}
                <div className="flex flex-col items-end gap-2.5 flex-1 min-w-0">
                  <div className="bg-[#06c755] text-white rounded-2xl rounded-tr-sm px-3 md:px-4 py-2 md:py-2.5 shadow-md max-w-[95%]">
                    <p className="text-xs md:text-sm">復縁するには？</p>
                  </div>
                  <div className="bg-[#06c755] text-white rounded-2xl rounded-tr-sm px-3 md:px-4 py-2 md:py-2.5 shadow-md max-w-[95%]">
                    <p className="text-xs md:text-sm">私の事どう思ってる？</p>
                  </div>
                  <div className="bg-[#06c755] text-white rounded-2xl rounded-tr-sm px-3 md:px-4 py-2 md:py-2.5 shadow-md max-w-[95%]">
                    <p className="text-xs md:text-sm">具体的な時期は？</p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-base md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
              人気占い師監修のチャット占いで24時間365日、いつでも高精度な本格占い
            </p>

            {/* 占い師画像 */}
            <div className="flex justify-center gap-3 md:gap-4 py-3 md:py-4 mt-3 md:mt-5">
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

            {/* チャット占いメッセージ */}
            <div className="relative mt-4 md:mt-7 px-4">
              {/* グラデーション背景 */}
              <div className="absolute inset-0 bg-gradient-to-r from-spiritual-accent/10 via-spiritual-gold/10 to-spiritual-accent/10 blur-xl"></div>

              <div className="relative max-w-2xl mx-auto">
                {/* ガラスモーフィックカード */}
                <div className="bg-white/5 backdrop-blur-sm border border-spiritual-gold/30 rounded-3xl p-4 md:p-8 shadow-2xl">
                  {/* 吹き出しとテキストの横並び */}
                  <div className="flex items-center gap-2 mb-2 md:mb-3">
                    <div className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-white rounded-2xl rounded-tl-sm px-3 md:px-4 py-1.5 md:py-2 shadow-lg">
                      <p className="text-sm md:text-base font-bold whitespace-nowrap">チャット占い</p>
                    </div>
                    <p className="text-lg md:text-2xl lg:text-3xl font-bold text-white">だから</p>
                  </div>

                  {/* メインメッセージ */}
                  <h3 className="text-xl md:text-3xl lg:text-4xl font-bold text-center">
                    <span className="bg-gradient-to-r from-white via-spiritual-gold to-white bg-clip-text text-transparent">
                      いつでも気軽に占える
                    </span>
                  </h3>
                </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-8 md:mb-12">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              スピチャが選ばれる理由
            </span>
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
            {features.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-4 md:p-6 text-center hover:border-spiritual-gold/30 transition-all duration-300"
              >
                <div className="text-spiritual-gold mb-2 flex justify-center">
                  {feature.icon}
                </div>
                <h4 className="text-sm md:text-base font-bold mb-1 md:mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-xs leading-relaxed hidden md:block">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 相談事例セクション */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              こんなお悩み、ありませんか？
            </span>
          </h3>
          <p className="text-center text-gray-300 mb-6 md:mb-8 text-sm md:text-base">
            人には言えない悩みも、スピチャなら安心して相談できます
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {consultationCases.map((caseText, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg p-3 md:p-4 text-center hover:border-spiritual-gold/30 transition-all duration-300"
              >
                <p className="text-white text-xs md:text-sm font-medium">{caseText}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お客様の声セクション */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-10">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              お客様の声
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-4 md:p-5 hover:border-spiritual-gold/30 transition-all duration-300"
              >
                <div className="flex items-start gap-2 mb-3">
                  <div className="text-spiritual-gold flex-shrink-0">
                    <Star className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                  </div>
                  <p className="text-gray-200 text-xs md:text-sm leading-relaxed">
                    {'"'}{testimonial.text}{'"'}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400">{testimonial.name}</p>
                  <span className="px-2 py-1 bg-spiritual-gold/20 border border-spiritual-gold/30 rounded-full text-xs text-spiritual-gold">
                    {testimonial.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* セキュリティ・信頼性セクション */}
      <section className="py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-2xl md:text-4xl font-bold text-center mb-4 md:mb-6">
            <span className="bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              安心・安全のセキュリティ
            </span>
          </h3>
          <p className="text-center text-gray-300 mb-6 md:mb-10 text-sm md:text-base">
            お客様の大切な情報は厳重に保護されています
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {securityFeatures.map((feature, index) => (
              <div
                key={index}
                className="backdrop-blur-lg bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-xl p-5 md:p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-spiritual-gold/20 border border-spiritual-gold/30 mb-3 md:mb-4">
                  <div className="text-spiritual-gold">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-base md:text-lg font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 md:mt-10 text-center">
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
              スピチャは、お客様の個人情報およびお支払い情報を最高水準のセキュリティで保護しています。
              <br className="hidden md:block" />
              悪用や漏洩の心配はございません。安心してご利用ください。
            </p>
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
                src="/images/logo.png?v=2"
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
