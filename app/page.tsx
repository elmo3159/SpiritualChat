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
    <div className="min-h-screen overflow-hidden relative">
      {/* 背景画像 */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/BackGround.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* 軽めのオーバーレイでコンテンツを読みやすく */}
        <div className="absolute inset-0 bg-spiritual-dark/20"></div>
      </div>

      {/* トップバナー */}
      <div className="relative z-10 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark backdrop-blur-sm py-3 px-4 text-center border-b-2 border-white/20 shadow-lg">
        <div className="text-sm md:text-lg font-extrabold text-white">
          <div className="mb-1">登録ですぐ1000pt付与 →</div>
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 md:w-6 md:h-6 text-white" />
            <span>＼</span>
            <span className="text-2xl md:text-3xl bg-white/20 px-3 py-1 rounded-lg">初回の占いは無料</span>
            <span>／</span>
            <Gift className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
        </div>
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
          {/* ロゴ */}
          <div className="flex items-center">
            <Image
              src="/images/logo.png?v=2"
              alt="スピチャ"
              width={140}
              height={56}
              className="w-auto h-8 md:h-10"
              priority
            />
          </div>

          {/* CTAボタン群 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-spiritual-pink hover:bg-spiritual-pink-dark text-white rounded-full font-bold text-sm transition-colors duration-300"
            >
              ログイン/登録
            </button>
          </div>
        </div>
      </header>

      {/* メインビジュアル */}
      <section className="relative z-10 pt-2 md:pt-6 pb-4 md:pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* メインキャッチコピー */}
          <div className="text-center mb-3 md:mb-5 px-2">
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold text-white mb-2 leading-tight">
              彼からの連絡が止まった理由、<br className="hidden md:block" />
              <span className="text-spiritual-pink-light">今すぐ</span>見えます
            </h1>
            <div className="space-y-1 mb-3">
              <p className="text-base md:text-2xl text-gray-200 font-semibold leading-relaxed">
                人気占い師監修 × AIチャット占い
              </p>
              <p className="text-sm md:text-xl text-gray-300 leading-relaxed">
                AIだから、誰にも言えない恥ずかしい悩みも相談できる
              </p>
            </div>
            {/* 悩みカテゴリ */}
            <div className="flex flex-wrap justify-center gap-1.5 mb-3">
              <span className="px-2.5 py-1 bg-spiritual-pink/20 border border-spiritual-pink/40 rounded-full text-xs md:text-sm text-spiritual-pink-lighter font-medium">
                #片思い
              </span>
              <span className="px-2.5 py-1 bg-spiritual-pink/20 border border-spiritual-pink/40 rounded-full text-xs md:text-sm text-spiritual-pink-lighter font-medium">
                #復縁
              </span>
              <span className="px-2.5 py-1 bg-spiritual-pink/20 border border-spiritual-pink/40 rounded-full text-xs md:text-sm text-spiritual-pink-lighter font-medium">
                #相手の気持ち
              </span>
              <span className="px-2.5 py-1 bg-spiritual-pink/20 border border-spiritual-pink/40 rounded-full text-xs md:text-sm text-spiritual-pink-lighter font-medium">
                #不倫/浮気
              </span>
            </div>

            {/* メインCTAボタン（ファーストビュー） */}
            <div className="mb-3">
              <button
                onClick={() => router.push('/signup')}
                className="w-full max-w-lg mx-auto block px-6 py-3 bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-gray-900 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all duration-300 shadow-2xl shadow-spiritual-gold/60 relative overflow-hidden border-4 border-white/30"
              >
                <div className="relative z-10">
                  <div className="text-xl md:text-3xl drop-shadow-md leading-tight">
                    今すぐ無料で鑑定する
                  </div>
                  <div className="text-xs md:text-sm font-normal mt-0.5 opacity-90">
                    （登録後すぐに結果が見れます）
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
              </button>

              {/* 完全秘密厳守バッジ */}
              <div className="text-center mt-2">
                <div className="inline-flex items-center gap-1.5 bg-white/95 px-4 py-1.5 rounded-full border-2 border-spiritual-pink-dark/40 shadow-lg">
                  <Shield className="w-4 h-4 text-spiritual-pink-dark" />
                  <div className="text-left">
                    <p className="text-xs md:text-sm font-black text-spiritual-pink-dark leading-tight">完全秘密厳守</p>
                    <p className="text-[10px] md:text-xs text-spiritual-purple">誰にもバレずに相談</p>
                  </div>
                </div>
              </div>
            </div>
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
          <div className="mb-3">
            <p className="text-center text-xs md:text-base text-white font-semibold mb-1.5 drop-shadow-md">
              ↓ 好みの先生を選んで相談！↓
            </p>
            <div className="flex justify-center items-center gap-3">
              {/* 天音そう */}
              <button
                onClick={() => router.push('/signup')}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-3 border-spiritual-pink/50 overflow-hidden shadow-lg hover:scale-110 hover:border-spiritual-gold active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <Image
                  src="/images/AmaneSou.jpeg"
                  alt="天音そう"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
              {/* 紫雲沙羅 */}
              <button
                onClick={() => router.push('/signup')}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-3 border-spiritual-pink/50 overflow-hidden shadow-lg hover:scale-110 hover:border-spiritual-gold active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <Image
                  src="/images/ShiunSara.jpeg"
                  alt="紫雲沙羅"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
              {/* ゆら */}
              <button
                onClick={() => router.push('/signup')}
                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-3 border-spiritual-pink/50 overflow-hidden shadow-lg hover:scale-110 hover:border-spiritual-gold active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <Image
                  src="/images/Yura.jpeg"
                  alt="ゆら"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </button>
            </div>
          </div>

          {/* チャットUIプレビュー */}
          <div className="max-w-2xl mx-auto mb-4 relative">
            <div className="rounded-3xl border-2 border-spiritual-pink/30 shadow-2xl overflow-hidden">
              <Image
                src="/images/Chatimage2.png"
                alt="チャット画面プレビュー"
                width={800}
                height={600}
                className="w-full h-auto"
              />
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

          {/* CTAボタン */}
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <button
                onClick={() => router.push('/signup')}
                className="w-full max-w-md mx-auto block px-8 py-5 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark text-white rounded-full font-bold text-xl md:text-2xl hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-pink/50 relative overflow-hidden"
              >
                <span className="relative z-10">今すぐ無料で占う</span>
                <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
              </button>
              <p className="text-xs md:text-sm text-gray-300 bg-spiritual-dark/40 inline-block px-4 py-2 rounded-full">
                ✨ 1回1000pt無料付与後、すぐに占いに使えます
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-sm md:text-base text-gray-300 font-semibold mb-2">
                💝 登録特典
              </p>
              <p className="text-xs md:text-sm text-gray-400">
                1回目の鑑定は完全無料 ／ 24時間いつでも相談OK
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* こんな悩みセクション */}
      <section className="relative z-10 py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-spiritual-pink/10 to-spiritual-purple/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-spiritual-pink/30 shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8 flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 text-spiritual-pink" />
              こんな悩みを抱えていませんか？
            </h2>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3 text-gray-200 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <CheckCircle className="w-6 h-6 text-spiritual-pink flex-shrink-0 mt-0.5" />
                <span className="text-base md:text-lg leading-relaxed">
                  <strong className="text-spiritual-pink-light">元彼と復縁できる可能性</strong>を知りたい
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-200 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <CheckCircle className="w-6 h-6 text-spiritual-pink flex-shrink-0 mt-0.5" />
                <span className="text-base md:text-lg leading-relaxed">
                  <strong className="text-spiritual-pink-light">片思いの相手に告白すべきタイミング</strong>を知りたい
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-200 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <CheckCircle className="w-6 h-6 text-spiritual-pink flex-shrink-0 mt-0.5" />
                <span className="text-base md:text-lg leading-relaxed">
                  <strong className="text-spiritual-pink-light">今の仕事を続けるべきか転職すべきか</strong>迷っている
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-200 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <CheckCircle className="w-6 h-6 text-spiritual-pink flex-shrink-0 mt-0.5" />
                <span className="text-base md:text-lg leading-relaxed">
                  彼からの<strong className="text-spiritual-pink-light">連絡が止まった理由</strong>が知りたい
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-200 bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                <CheckCircle className="w-6 h-6 text-spiritual-pink flex-shrink-0 mt-0.5" />
                <span className="text-base md:text-lg leading-relaxed">
                  <strong className="text-spiritual-pink-light">相手の本当の気持ち</strong>を確かめたい
                </span>
              </li>
            </ul>

            <div className="text-center">
              <p className="text-lg md:text-xl text-white font-semibold mb-4">
                そんなあなたの悩みに、<br className="md:hidden" />
                <span className="text-spiritual-gold">人気占い師監修のAI</span>が寄り添います
              </p>
              <button
                onClick={() => router.push('/signup')}
                className="px-8 py-4 bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-gray-900 rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl shadow-spiritual-gold/50"
              >
                今すぐ無料で相談する
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="relative z-10 py-16 px-4 bg-spiritual-darker/50">
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
      <section className="relative z-10 py-16 px-4">
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
              className="px-12 py-4 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark text-white rounded-full font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-pink/50"
            >
              今すぐ無料で始める
            </button>
          </div>
        </div>
      </section>

      {/* よくある質問セクション */}
      <section className="relative z-10 py-16 px-4 bg-spiritual-dark/60">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">
            よくある質問
          </h2>
          <p className="text-gray-300 text-center mb-12">
            安心してご利用いただくための情報をまとめました
          </p>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <details className="bg-spiritual-navy/40 backdrop-blur-sm rounded-xl border border-spiritual-pink/20 p-5 hover:border-spiritual-pink/40 transition-colors group">
              <summary className="font-bold text-white cursor-pointer flex items-center justify-between">
                <span>💰 本当に無料で占えますか？</span>
                <span className="text-spiritual-pink group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-300 mt-4 leading-relaxed">
                はい、初回登録時に1000ポイントを無料でプレゼントしており、1回の鑑定（400文字程度）に必要な1000ポイントと同じです。つまり、1回目の鑑定は完全無料でお試しいただけます。
              </p>
            </details>

            {/* FAQ 2 */}
            <details className="bg-spiritual-navy/40 backdrop-blur-sm rounded-xl border border-spiritual-pink/20 p-5 hover:border-spiritual-pink/40 transition-colors group">
              <summary className="font-bold text-white cursor-pointer flex items-center justify-between">
                <span>🔒 個人情報は安全ですか？</span>
                <span className="text-spiritual-pink group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-300 mt-4 leading-relaxed">
                SSL暗号化通信により、すべての情報は安全に保護されています。また、第三者に情報を開示・提供することは一切ございません。詳しくは
                <button onClick={() => router.push('/privacy')} className="text-spiritual-pink-light hover:underline mx-1">プライバシーポリシー</button>
                をご確認ください。
              </p>
            </details>

            {/* FAQ 3 */}
            <details className="bg-spiritual-navy/40 backdrop-blur-sm rounded-xl border border-spiritual-pink/20 p-5 hover:border-spiritual-pink/40 transition-colors group">
              <summary className="font-bold text-white cursor-pointer flex items-center justify-between">
                <span>⏰ いつでも占えますか？</span>
                <span className="text-spiritual-pink group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-300 mt-4 leading-relaxed">
                24時間365日、いつでもご利用いただけます。深夜でも早朝でも、あなたのタイミングでAI占い師がすぐに鑑定結果をお届けします。
              </p>
            </details>

            {/* FAQ 4 */}
            <details className="bg-spiritual-navy/40 backdrop-blur-sm rounded-xl border border-spiritual-pink/20 p-5 hover:border-spiritual-pink/40 transition-colors group">
              <summary className="font-bold text-white cursor-pointer flex items-center justify-between">
                <span>💳 支払い方法は何がありますか？</span>
                <span className="text-spiritual-pink group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-300 mt-4 leading-relaxed">
                クレジットカード（Visa / Mastercard / JCB / American Express）でのお支払いが可能です。決済はStripeの安全なシステムを使用しており、当サービス側でカード情報を保持することはありません。
              </p>
            </details>

            {/* FAQ 5 */}
            <details className="bg-spiritual-navy/40 backdrop-blur-sm rounded-xl border border-spiritual-pink/20 p-5 hover:border-spiritual-pink/40 transition-colors group">
              <summary className="font-bold text-white cursor-pointer flex items-center justify-between">
                <span>🎯 AIの占いは当たりますか？</span>
                <span className="text-spiritual-pink group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-300 mt-4 leading-relaxed">
                人気スピリチュアル占い師チーム監修のロジックを使用しており、あなたのプロフィールや過去の相談履歴を基に、専門的な鑑定結果をお届けします。多くのユーザー様から「的中した」「心に響いた」とのお声をいただいております。
              </p>
            </details>

            {/* FAQ 6 */}
            <details className="bg-spiritual-navy/40 backdrop-blur-sm rounded-xl border border-spiritual-pink/20 p-5 hover:border-spiritual-pink/40 transition-colors group">
              <summary className="font-bold text-white cursor-pointer flex items-center justify-between">
                <span>🔄 退会・解約はできますか？</span>
                <span className="text-spiritual-pink group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="text-gray-300 mt-4 leading-relaxed">
                いつでもマイページから退会手続きが可能です。月額課金などのサブスクリプションではなく、ポイント購入制ですので、退会に伴う違約金等は一切発生しません。
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* フッター */}
      <footer className="relative z-10 py-12 px-4 border-t border-white/10 bg-spiritual-dark/80 mb-20 md:mb-0">
        <div className="container mx-auto max-w-6xl">
          {/* 信頼性インジケーター */}
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 mb-8 pb-8 border-b border-white/10">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <svg className="w-5 h-5 text-spiritual-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>SSL暗号化通信</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <svg className="w-5 h-5 text-spiritual-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>プライバシー保護</span>
            </div>
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <svg className="w-5 h-5 text-spiritual-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>安全な決済（Stripe）</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-6">
            {/* ブランド */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start mb-2">
                <Image
                  src="/images/logo.png?v=2"
                  alt="スピチャ"
                  width={120}
                  height={42}
                  className="w-auto h-7"
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
                className="text-gray-300 hover:text-spiritual-pink-light transition-colors font-medium"
              >
                利用規約
              </button>
              <button
                onClick={() => router.push('/privacy')}
                className="text-gray-300 hover:text-spiritual-pink-light transition-colors font-medium"
              >
                プライバシーポリシー
              </button>
              <button
                onClick={() => router.push('/legal/tokusho')}
                className="text-gray-300 hover:text-spiritual-pink-light transition-colors font-medium"
              >
                特定商取引法
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
