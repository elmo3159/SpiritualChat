'use client'

import { useEffect, useState } from 'react'
import { X, Sparkles, Gift } from 'lucide-react'

interface Props {
  points: number
  onClose: () => void
}

/**
 * 新規登録ボーナスポップアップ
 *
 * 初回訪問時に500ptプレゼントを通知するモーダル
 * モバイルファースト、スピリチュアルなデザイン
 */
export default function WelcomePopup({ points, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // マウント後にアニメーション開始
    setTimeout(() => setIsVisible(true), 100)
    setTimeout(() => setIsAnimating(true), 300)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300)
  }

  return (
    <div
      className={`
        fixed inset-0 z-[100] flex items-center justify-center p-4 pb-safe
        transition-all duration-300
        ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0'}
      `}
      onClick={handleClose}
    >
      {/* ポップアップカード */}
      <div
        className={`
          relative w-full max-w-md bg-gradient-to-br from-spiritual-purple/95 to-spiritual-light/95
          backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-spiritual-gold/30
          p-6 md:p-8 transition-all duration-500
          ${isVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 閉じるボタン */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 active:scale-95"
          aria-label="閉じる"
        >
          <X className="w-5 h-5 text-gray-200" />
        </button>

        {/* ヘッダー - 輝くアイコン */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* 背景の光 */}
            <div className={`
              absolute inset-0 bg-gradient-to-br from-spiritual-accent to-spiritual-gold
              rounded-full blur-2xl opacity-60 animate-pulse
              ${isAnimating ? 'scale-150' : 'scale-100'}
              transition-transform duration-1000
            `} />

            {/* ギフトアイコン */}
            <div className="relative bg-gradient-to-br from-spiritual-accent to-spiritual-gold p-5 rounded-full shadow-lg">
              <Gift className="w-12 h-12 text-spiritual-dark" />
            </div>

            {/* 周囲のキラキラ */}
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-spiritual-gold animate-ping" />
            <Sparkles className="absolute -bottom-1 -left-1 w-5 h-5 text-spiritual-accent animate-ping" style={{ animationDelay: '0.5s' }} />
          </div>
        </div>

        {/* タイトル */}
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent">
          ようこそスピチャへ！
        </h2>

        {/* サブタイトル */}
        <p className="text-center text-gray-200 text-sm md:text-base mb-6">
          新規登録ボーナスとして
        </p>

        {/* ポイント表示 */}
        <div className={`
          bg-gradient-to-br from-spiritual-accent/20 to-spiritual-gold/20
          border-2 border-spiritual-gold/50 rounded-2xl p-6 mb-6
          transition-all duration-700 delay-200
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-spiritual-gold animate-spin" style={{ animationDuration: '3s' }} />
            <p className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-spiritual-accent to-spiritual-gold bg-clip-text text-transparent">
              {points.toLocaleString()}
            </p>
            <span className="text-2xl md:text-3xl font-bold text-spiritual-gold">pt</span>
            <Sparkles className="w-6 h-6 text-spiritual-accent animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
          <p className="text-center text-spiritual-lavender text-sm">
            プレゼント！
          </p>
        </div>

        {/* メッセージ */}
        <div className="bg-spiritual-dark/30 border border-spiritual-lavender/30 rounded-xl p-4 mb-6 backdrop-blur-sm">
          <p className="text-center text-gray-200 text-sm md:text-base leading-relaxed">
            このポイントを使って、今すぐ無料で<br />
            占いの結果を見てみましょう！✨
          </p>
        </div>

        {/* ボタン */}
        <button
          onClick={handleClose}
          className="w-full bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl hover:shadow-spiritual-gold/50 transition-all duration-300 active:scale-[0.98] relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-spiritual-gold to-spiritual-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-base md:text-lg">占いを始める</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </button>

        {/* 注釈 */}
        <p className="text-center text-xs text-spiritual-lavender mt-4">
          1回の鑑定結果を見るには500ptが必要です
        </p>
      </div>
    </div>
  )
}
