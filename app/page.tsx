'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Sparkles, MessageCircle, Clock, Heart, Shield, Star, Zap, Users, TrendingUp, CheckCircle, Gift } from 'lucide-react'
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

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-spiritual-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-pink mx-auto"></div>
          <p className="mt-4 text-gray-300">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-dark via-spiritual-darker to-spiritual-navy overflow-hidden">
      {/* 星空背景 */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(2px 2px at 20% 30%, white, transparent),
                           radial-gradient(2px 2px at 60% 70%, white, transparent),
                           radial-gradient(1px 1px at 50% 50%, white, transparent),
                           radial-gradient(1px 1px at 80% 10%, white, transparent),
                           radial-gradient(2px 2px at 90% 60%, white, transparent),
                           radial-gradient(1px 1px at 33% 80%, white, transparent)`,
          backgroundSize: '200% 200%',
          backgroundPosition: '0% 0%',
          opacity: 0.4
        }} />
      </div>

      {/* トップバナー */}
      <div className="relative z-10 bg-gradient-to-r from-spiritual-pink via-spiritual-pink-dark to-spiritual-pink text-white py-3 px-4 text-center">
        <p className="text-sm md:text-base font-bold flex items-center justify-center gap-2">
          <Gift className="w-5 h-5" />
          登録者すぐ1000pt付与 → 初回の占いは無料
          <Gift className="w-5 h-5" />
        </p>
      </div>

      {/* ヘッダー */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-pink/30'
            : 'bg-spiritual-dark/50 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          {/* ロゴ + マスコット */}
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png?v=2"
              alt="スピチャ"
              width={140}
              height={56}
              className="w-auto h-8 md:h-10"
              priority
            />
            <Image
              src="/images/mascot2.png"
              alt="マスコット"
              width={40}
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
          </div>

          {/* CTAボタン群 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/signup')}
              className="hidden md:block px-4 py-2 bg-gradient-to-r from-spiritual-green to-spiritual-green-light text-white rounded-full font-bold text-sm hover:scale-105 transition-transform duration-300 shadow-lg"
            >
              後続するには？
            </button>
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-spiritual-pink hover:bg-spiritual-pink-dark text-white rounded-full font-bold text-sm transition-colors duration-300"
            >
              ログイン
            </button>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="relative pt-8 md:pt-16 pb-12 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* メインキャッチコピー */}
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              運絡こない理由、<br className="md:hidden" />
              <span className="text-spiritual-pink-lighter">3分</span>でわかります
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-2">
              人気占い師監修 × AIチャット占い
            </p>
            <p className="text-base md:text-lg text-gray-400">
              24時間いつでも、あなた専用の答えが返ってきます
            </p>
          </div>

          {/* マスコット装飾（PC表示） */}
          <div className="hidden md:block">
            <Image
              src="/images/mascot3.png"
              alt=""
              width={120}
              height={120}
              className="absolute top-20 left-4 lg:left-10 w-24 lg:w-32 opacity-80 animate-bounce"
              style={{ animationDuration: '3s' }}
            />
            <Image
              src="/images/mascot4.png"
              alt=""
              width={100}
              height={100}
              className="absolute top-40 right-4 lg:right-10 w-20 lg:w-28 opacity-80 animate-bounce"
              style={{ animationDuration: '4s', animationDelay: '0.5s' }}
            />
          </div>

          {/* 占い師アバター */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-spiritual-pink/50 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-purple-300 to-pink-300"></div>
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-spiritual-pink/50 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-blue-300 to-purple-300"></div>
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-spiritual-pink/50 bg-gradient-to-br from-green-400 to-teal-400 flex items-center justify-center overflow-hidden shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-green-300 to-teal-300"></div>
            </div>
          </div>

          <p className="text-center text-sm md:text-base text-gray-400 mb-8">
            監修者：スピリチュアル専門占い師チーム
          </p>

          {/* チャットUIプレビュー */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-4 md:p-6 border-2 border-spiritual-pink/30 shadow-2xl">
              {/* チャットヘッダー */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <Sparkles className="w-5 h-5 text-spiritual-pink" />
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">AI占い師</p>
                  <p className="text-xs text-gray-400">オンライン</p>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-spiritual-pink rounded-full"></div>
                  <div className="w-2 h-2 bg-spiritual-pink rounded-full"></div>
                  <div className="w-2 h-2 bg-spiritual-pink rounded-full"></div>
                </div>
              </div>

              {/* チャットメッセージ */}
              <div className="space-y-4">
                {/* 占い師のメッセージ */}
                <div className="flex items-start gap-2">
                  <Image
                    src="/images/mascot1.png"
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-spiritual-pink-light to-white/90 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                      <p className="text-sm md:text-base">
                        あなたの状況を読み取ってみますね…
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <Star className="w-3 h-3 text-spiritual-gold" />
                      <Star className="w-3 h-3 text-spiritual-gold" />
                      <Star className="w-3 h-3 text-spiritual-gold" />
                    </div>
                  </div>
                </div>

                {/* 占い師の回答 */}
                <div className="flex items-start gap-2">
                  <Image
                    src="/images/mascot1.png"
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-spiritual-pink-light to-white/90 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                      <p className="text-sm md:text-base">
                        彼は今、運絡できない理由を抱えています。でもあなたへの気持ちはまだ残っていますよ。
                      </p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1">
                      <Star className="w-3 h-3 text-spiritual-gold" />
                      <Star className="w-3 h-3 text-spiritual-gold" />
                    </div>
                  </div>
                </div>

                {/* さらに詳しく */}
                <div className="flex items-start gap-2">
                  <Image
                    src="/images/mascot1.png"
                    alt=""
                    width={32}
                    height={32}
                    className="w-8 h-8 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-spiritual-pink-light to-white/90 text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-md">
                      <p className="text-sm md:text-base">
                        このあとどう動くべきか、詳しくお伝えしますね。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* マスコット装飾（スマホ表示） */}
              <div className="md:hidden absolute -bottom-4 -right-2">
                <Image
                  src="/images/mascot5.png"
                  alt=""
                  width={80}
                  height={80}
                  className="w-16 h-16"
                />
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="text-center space-y-4">
            <button
              onClick={() => router.push('/signup')}
              className="w-full max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-spiritual-green via-spiritual-green-light to-spiritual-green text-white rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-green/50"
            >
              無料で占える
            </button>
            <button
              onClick={() => router.push('/daily-fortune')}
              className="w-full max-w-md mx-auto block px-8 py-4 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark text-white rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-pink/50"
            >
              私のあなた違って？
            </button>
            <p className="text-sm text-gray-400">
              ※登録すると1000ptプレゼント
            </p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="relative py-16 px-4 bg-spiritual-darker/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            スピチャが選ばれる<span className="text-spiritual-pink">理由</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 特徴1 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-pink/20 hover:border-spiritual-pink/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-spiritual-pink to-spiritual-pink-dark rounded-full flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                すぐに結果がわかる
              </h3>
              <p className="text-gray-300 text-center text-sm">
                待ち時間なし。質問したらすぐに本格鑑定結果をお届けします
              </p>
            </div>

            {/* 特徴2 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-pink/20 hover:border-spiritual-pink/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-spiritual-green to-spiritual-green-dark rounded-full flex items-center justify-center mb-4 mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                24時間365日対応
              </h3>
              <p className="text-gray-300 text-center text-sm">
                深夜でも早朝でも、あなたの好きな時間にいつでも占えます
              </p>
            </div>

            {/* 特徴3 */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-pink/20 hover:border-spiritual-pink/50 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-spiritual-gold to-spiritual-gold-light rounded-full flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                完全匿名で安心
              </h3>
              <p className="text-gray-300 text-center text-sm">
                誰にも知られず相談できる。プライバシー保護を徹底
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 利用の流れ */}
      <section className="relative py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            <span className="text-spiritual-pink">3ステップ</span>で簡単占い
          </h2>

          <div className="space-y-8">
            {/* ステップ1 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark rounded-full flex items-center justify-center text-white font-bold text-xl">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">無料会員登録</h3>
                <p className="text-gray-300">
                  Googleアカウントで簡単登録。今なら1000ptプレゼント！
                </p>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark rounded-full flex items-center justify-center text-white font-bold text-xl">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">プロフィール入力</h3>
                <p className="text-gray-300">
                  あなたの情報と悩みを入力。より精度の高い鑑定が受けられます
                </p>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark rounded-full flex items-center justify-center text-white font-bold text-xl">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">AIとチャットで占い</h3>
                <p className="text-gray-300">
                  占い師を選んでチャット開始。すぐに鑑定結果が届きます！
                </p>
              </div>
            </div>
          </div>

          {/* CTAボタン */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/signup')}
              className="px-12 py-4 bg-gradient-to-r from-spiritual-green to-spiritual-green-light text-white rounded-full font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-green/50"
            >
              今すぐ無料で始める
            </button>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="py-12 px-4 border-t border-white/10 bg-spiritual-dark/80 mb-20 md:mb-0">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            {/* ブランド */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <Image
                  src="/images/logo.png?v=2"
                  alt="スピチャ"
                  width={120}
                  height={42}
                  className="w-auto h-7"
                />
                <Image
                  src="/images/mascot6.png"
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
              </div>
              <p className="text-xs text-gray-400">
                24時間365日、あなたの悩みに寄り添うAI占いサービス
              </p>
            </div>

            {/* リンク */}
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
              <button
                onClick={() => router.push('/terms')}
                className="text-gray-400 hover:text-spiritual-pink transition-colors"
              >
                利用規約
              </button>
              <button
                onClick={() => router.push('/privacy')}
                className="text-gray-400 hover:text-spiritual-pink transition-colors"
              >
                プライバシーポリシー
              </button>
              <button
                onClick={() => router.push('/legal/tokusho')}
                className="text-gray-400 hover:text-spiritual-pink transition-colors"
              >
                特定商取引法
              </button>
              <button
                onClick={() => router.push('/feedback')}
                className="text-gray-400 hover:text-spiritual-pink transition-colors"
              >
                お問い合わせ
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500 pt-6 border-t border-white/5">
            © 2025 スピチャ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
