'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Heart } from 'lucide-react'
import { useState } from 'react'
import type { FortuneTellerCard as FortuneTellerCardType } from '@/lib/types/fortune-teller'

interface Props {
  fortuneTeller: FortuneTellerCardType
  isFavorite?: boolean
  onToggleFavorite?: (fortuneTellerId: string, isFavorite: boolean) => Promise<void>
  lastMessage?: string
  lastMessageSender?: 'user' | 'fortune_teller'
  lastMessageAt?: string
  unreadCount?: number
}

/**
 * 占い師カードコンポーネント（LINE風デザイン）
 *
 * LINE風のシンプルなカード形式で占い師情報を表示します。
 * タップすると該当の占い師とのチャットページに遷移します。
 */
export default function FortuneTellerCard({
  fortuneTeller,
  isFavorite = false,
  onToggleFavorite,
  lastMessage,
  lastMessageSender,
  lastMessageAt,
  unreadCount = 0
}: Props) {
  const [isToggling, setIsToggling] = useState(false)

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault() // カード全体のLinkクリックを防止
    e.stopPropagation()

    if (!onToggleFavorite || isToggling) return

    setIsToggling(true)
    try {
      await onToggleFavorite(fortuneTeller.id, isFavorite)
    } catch (error) {
      console.error('お気に入り切り替えエラー:', error)
    } finally {
      setIsToggling(false)
    }
  }

  // 相対時間表示
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
  }

  // キャッチフレーズの文字数に応じてフォントサイズを調整
  const getTitleFontSize = (title: string) => {
    const length = title.length
    if (length <= 10) return 'text-sm md:text-base'
    if (length <= 15) return 'text-xs md:text-sm'
    return 'text-[10px] md:text-xs'
  }

  // キャッチフレーズの文字数に応じて装飾の幅を調整
  const getDecorationWidth = (title: string) => {
    const length = title.length
    if (length <= 10) return 'w-6 md:w-8'
    if (length <= 15) return 'w-4 md:w-6'
    return 'w-2 md:w-4'
  }

  return (
    <Link
      href={`/chat/${fortuneTeller.id}`}
      className="block relative rounded-none md:rounded-2xl shadow-2xl shadow-purple-500/20 transition-all duration-500 overflow-hidden group active:scale-[0.98]"
    >
      {/* オーロラ背景レイヤー1 (紫) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(120deg, #8b5cf6 0%, #a855f7 50%, #8b5cf6 100%)',
          animation: 'aurora1 6s ease-in-out infinite',
        }}
      />

      {/* オーロラ背景レイヤー2 (ピンク) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(240deg, transparent 30%, #ec4899 50%, transparent 70%)',
          animation: 'aurora2 7s ease-in-out infinite',
        }}
      />

      {/* オーロラ背景レイヤー3 (青緑) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(60deg, transparent 40%, #14b8a6 60%, transparent 80%)',
          animation: 'aurora3 8s ease-in-out infinite',
        }}
      />

      {/* ガラスモーフィズム効果 */}
      <div className="absolute inset-0 backdrop-blur-sm bg-white/5" />

      {/* ゴールドボーダーグラデーション */}
      <div className="absolute inset-0 rounded-none md:rounded-2xl p-[2px] bg-gradient-to-br from-spiritual-gold via-spiritual-accent to-spiritual-gold opacity-70 transition-opacity duration-500 -z-10" />

      {/* タップ時の光エフェクト（スマホ向け） */}
      <div className="absolute inset-0 opacity-0 active:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-0 bg-gradient-radial from-white/30 via-transparent to-transparent" />
      </div>

      {/* CSS アニメーション定義 */}
      <style jsx>{`
        @keyframes aurora1 {
          0% { transform: translateY(0%) translateX(0%) scale(1); opacity: 0.7; }
          33% { transform: translateY(-4%) translateX(3%) scale(1.015); opacity: 0.8; }
          66% { transform: translateY(3%) translateX(-2%) scale(0.99); opacity: 0.65; }
          100% { transform: translateY(0%) translateX(0%) scale(1); opacity: 0.7; }
        }
        @keyframes aurora2 {
          0% { transform: translateX(0%) rotate(0deg) scale(1); opacity: 0.5; }
          33% { transform: translateX(4%) rotate(1.5deg) scale(1.02); opacity: 0.65; }
          66% { transform: translateX(-3%) rotate(-1deg) scale(0.98); opacity: 0.45; }
          100% { transform: translateX(0%) rotate(0deg) scale(1); opacity: 0.5; }
        }
        @keyframes aurora3 {
          0% { transform: translateX(0%) translateY(0%) rotate(0deg); opacity: 0.4; }
          33% { transform: translateX(-3%) translateY(4%) rotate(-1deg); opacity: 0.55; }
          66% { transform: translateX(2%) translateY(-3%) rotate(1deg); opacity: 0.35; }
          100% { transform: translateX(0%) translateY(0%) rotate(0deg); opacity: 0.4; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>

      {/* お気に入りボタン */}
      {onToggleFavorite && (
        <button
          onClick={handleFavoriteClick}
          disabled={isToggling}
          className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-spiritual-dark/80 backdrop-blur-sm flex items-center justify-center hover:bg-spiritual-dark/90 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isFavorite
                ? 'fill-red-500 text-red-500 scale-110'
                : 'text-gray-300 hover:text-red-400'
            }`}
          />
        </button>
      )}

      {/* 背景の星キラキラ */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-2 right-4 w-1 h-1 bg-spiritual-gold rounded-full animate-pulse" />
        <div className="absolute top-6 right-12 w-1 h-1 bg-spiritual-accent rounded-full animate-pulse delay-100" />
        <div className="absolute bottom-4 right-8 w-1 h-1 bg-spiritual-gold rounded-full animate-pulse delay-200" />
      </div>

      <div className="relative p-4 md:p-5 flex items-center gap-2 md:gap-4">
        {/* アバター - 二重枠でゴージャスに */}
        <div className="flex-shrink-0 relative">
          {/* 外側の輝く枠 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-spiritual-gold via-spiritual-accent to-spiritual-gold opacity-80 blur-sm group-hover:blur-md group-hover:opacity-100 transition-all duration-500" />

          {/* アバター本体 */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-[3px] ring-spiritual-gold/70 group-hover:ring-[4px] group-hover:ring-spiritual-gold transition-all duration-500 shadow-2xl shadow-spiritual-gold/50">
            {/* 内側の枠 */}
            <div className="absolute inset-0 rounded-full ring-2 ring-inset ring-white/30 z-10" />
            <Image
              src={fortuneTeller.avatar_url || '/images/default-avatar.png'}
              alt={fortuneTeller.name}
              width={128}
              height={128}
              className="w-full h-full object-cover relative z-0"
              unoptimized
            />
          </div>
        </div>

        {/* 占い師情報 */}
        <div className="flex-1 min-w-0">
          {/* 名前 - 白でくっきり */}
          <h3 className="text-base md:text-lg font-bold text-white drop-shadow-lg group-hover:text-spiritual-gold transition-colors duration-300 text-center mb-1">
            {fortuneTeller.name}
          </h3>

          {/* キャッチフレーズ - ゴールドグラデーション */}
          <div className="relative flex items-center justify-center gap-2 mb-2 px-2 py-1.5">
            {/* 放射状グラデーション背景 */}
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse 95% 100% at center, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 40%, rgba(0, 0, 0, 0.05) 60%, transparent 75%)'
              }}
            />

            {/* コンテンツ */}
            <div className="relative flex items-center justify-center gap-2 w-full">
              {/* 左装飾 */}
              <div className="flex items-center gap-1 flex-shrink">
                <span className="text-spiritual-gold text-xs md:text-sm animate-pulse">✦</span>
                <div className={`${getDecorationWidth(fortuneTeller.title)} h-[2px] bg-gradient-to-r from-transparent via-spiritual-gold to-spiritual-accent rounded-full shadow-sm shadow-spiritual-gold/50`} />
              </div>

              {/* キャッチフレーズテキスト */}
              <p className={`${getTitleFontSize(fortuneTeller.title)} font-bold bg-gradient-to-r from-spiritual-gold via-spiritual-accent to-spiritual-gold bg-clip-text text-transparent group-hover:from-spiritual-accent group-hover:via-spiritual-gold group-hover:to-spiritual-accent transition-all duration-500 text-center drop-shadow-md flex-shrink-0 px-1`}>
                {fortuneTeller.title}
              </p>

              {/* 右装飾 */}
              <div className="flex items-center gap-1 flex-shrink">
                <div className={`${getDecorationWidth(fortuneTeller.title)} h-[2px] bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-transparent rounded-full shadow-sm shadow-spiritual-gold/50`} />
                <span
                  className="text-spiritual-gold text-xs md:text-sm animate-pulse"
                  style={{ animationDelay: '1s' }}
                >
                  ✦
                </span>
              </div>
            </div>
          </div>

          {/* 得意分野タグ - グラデーション背景 */}
          <div className="flex gap-1 flex-nowrap items-center w-full mb-2">
            {fortuneTeller.specialties.slice(0, 3).map((specialty, index) => (
              <span
                key={specialty}
                className="inline-flex items-center px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r from-spiritual-lavender/40 to-spiritual-purple/40 text-white border border-spiritual-gold/40 group-hover:border-spiritual-gold group-hover:from-spiritual-gold/30 group-hover:to-spiritual-accent/30 transition-all duration-300 shadow-lg backdrop-blur-sm flex-shrink min-w-0"
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
              >
                <span className="truncate flex items-center gap-0.5">
                  <span className="flex-shrink-0">✦</span>
                  <span className="truncate">{specialty}</span>
                </span>
              </span>
            ))}
            {fortuneTeller.specialties.length > 3 && (
              <span className="inline-flex items-center px-2 md:px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold bg-gradient-to-r from-spiritual-accent/50 to-spiritual-gold/50 text-white border border-spiritual-gold/60 shadow-lg backdrop-blur-sm flex-shrink-0">
                +{fortuneTeller.specialties.length - 3}
              </span>
            )}
          </div>

          {/* 最新メッセージプレビュー */}
          {lastMessage && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs md:text-sm text-gray-300 truncate flex-1">
                {lastMessageSender === 'user' && (
                  <span className="text-spiritual-lavender/80">あなた: </span>
                )}
                {lastMessage}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {lastMessageAt && (
                  <span className="text-[10px] md:text-xs text-spiritual-lavender/60">
                    {getRelativeTime(lastMessageAt)}
                  </span>
                )}
                {unreadCount > 0 && (
                  <div className="min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-[10px] md:text-xs font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
