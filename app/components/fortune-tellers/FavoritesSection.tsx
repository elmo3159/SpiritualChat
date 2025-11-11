'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ChevronRight } from 'lucide-react'
import type { FortuneTeller } from '@/lib/types/fortune-teller'

interface Props {
  fortuneTellers: FortuneTeller[]
}

/**
 * お気に入り占い師セクション
 *
 * ユーザーがお気に入りに追加した占い師を横スクロールで表示します。
 * お気に入りがない場合は何も表示しません。
 */
export default function FavoritesSection({ fortuneTellers }: Props) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // お気に入り一覧を取得
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites')
        if (response.ok) {
          const data = await response.json()
          setFavoriteIds(data.favoriteIds || [])
        }
      } catch (error) {
        console.error('お気に入り取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [])

  // お気に入りの占い師のみをフィルター
  const favoriteFortuneTellers = fortuneTellers.filter((ft) =>
    favoriteIds.includes(ft.id)
  )

  // お気に入りがない場合は何も表示しない
  if (isLoading || favoriteFortuneTellers.length === 0) {
    return null
  }

  return (
    <div className="mb-8 md:mb-12">
      {/* セクションヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 md:w-6 md:h-6 text-red-500 fill-red-500" />
          <h3 className="text-lg md:text-xl font-bold text-gray-100">
            お気に入りの占い師
          </h3>
        </div>
        <span className="text-sm text-spiritual-lavender">
          {favoriteFortuneTellers.length}人
        </span>
      </div>

      {/* 横スクロールカード */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        <div className="flex gap-3 md:gap-4" style={{ minWidth: 'min-content' }}>
          {favoriteFortuneTellers.map((fortuneTeller) => (
            <Link
              key={fortuneTeller.id}
              href={`/chat/${fortuneTeller.id}`}
              className="group flex-shrink-0 w-32 md:w-40"
            >
              {/* カード */}
              <div className="relative bg-gradient-to-br from-spiritual-purple/90 to-spiritual-light/90 backdrop-blur-md rounded-2xl p-3 md:p-4 shadow-lg hover:shadow-2xl hover:shadow-spiritual-gold/20 transition-all duration-300 border-2 border-spiritual-gold/40 hover:border-spiritual-gold overflow-hidden group-active:scale-95">
                {/* 背景エフェクト */}
                <div className="absolute inset-0 bg-gradient-to-br from-spiritual-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* アバター */}
                <div className="relative mb-2 md:mb-3">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto rounded-full overflow-hidden ring-2 ring-spiritual-gold/50 group-hover:ring-4 group-hover:ring-spiritual-gold transition-all duration-300 shadow-xl">
                    <Image
                      src={fortuneTeller.avatar_url || '/images/default-avatar.png'}
                      alt={fortuneTeller.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>

                  {/* ハートバッジ */}
                  <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-spiritual-dark">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>

                {/* 名前 */}
                <h4 className="text-sm md:text-base font-bold text-white text-center mb-1 truncate">
                  {fortuneTeller.name}
                </h4>

                {/* キャッチフレーズ */}
                <p className="text-[10px] md:text-xs text-spiritual-gold text-center truncate">
                  {fortuneTeller.title}
                </p>

                {/* チャットアイコン */}
                <div className="flex items-center justify-center mt-2 text-spiritual-lavender group-hover:text-spiritual-gold transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* カスタムスクロールバー非表示 */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
