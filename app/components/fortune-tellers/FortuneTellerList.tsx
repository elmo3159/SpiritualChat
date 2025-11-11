'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import FortuneTellerCard from './FortuneTellerCard'
import type { FortuneTeller } from '@/lib/types/fortune-teller'
import { toFortuneTellerCard } from '@/lib/types/fortune-teller'
import { Sparkles } from 'lucide-react'

interface ConversationMetadata {
  fortune_teller_id: string
  last_message_text?: string
  last_message_sender?: 'user' | 'fortune_teller'
  last_message_at?: string
  unread_count: number
}

interface Props {
  fortuneTellers: FortuneTeller[]
}

/**
 * 占い師一覧コンポーネント
 *
 * 占い師のリストをLINE風のカード形式で表示します。
 * 占い師がいない場合は空状態を表示します。
 */
export default function FortuneTellerList({ fortuneTellers }: Props) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([])
  const [conversationMetadata, setConversationMetadata] = useState<Record<string, ConversationMetadata>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showFavoriteOnly, setShowFavoriteOnly] = useState(false)

  // お気に入り一覧と会話メタデータを取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // お気に入り取得
        const favResponse = await fetch('/api/favorites')
        if (favResponse.ok) {
          const favData = await favResponse.json()
          setFavoriteIds(favData.favoriteIds || [])
        }

        // 会話メタデータ取得
        const supabase = createClient()
        const { data: metadata, error } = await supabase
          .from('conversation_metadata')
          .select('*')

        if (!error && metadata) {
          const metadataMap: Record<string, ConversationMetadata> = {}
          metadata.forEach((item) => {
            metadataMap[item.fortune_teller_id] = item
          })
          setConversationMetadata(metadataMap)
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // お気に入り切り替え処理
  const handleToggleFavorite = async (fortuneTellerId: string, isFavorite: boolean) => {
    try {
      if (isFavorite) {
        // お気に入りから削除
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fortuneTellerId }),
        })

        if (response.ok) {
          setFavoriteIds((prev) => prev.filter((id) => id !== fortuneTellerId))
        }
      } else {
        // お気に入りに追加
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fortuneTellerId }),
        })

        if (response.ok) {
          setFavoriteIds((prev) => [...prev, fortuneTellerId])
        }
      }
    } catch (error) {
      console.error('お気に入り切り替えエラー:', error)
    }
  }

  // フィルタリング（お気に入りのみ）
  const filteredFortuneTellers = fortuneTellers.filter((ft) => {
    if (showFavoriteOnly) {
      return favoriteIds.includes(ft.id)
    }
    return true
  })

  if (!fortuneTellers || fortuneTellers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-spiritual-lavender/50 to-spiritual-lavender-light/50 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-lg border border-spiritual-lavender/30">
          <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-spiritual-gold animate-pulse" />
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-2">
          占い師が見つかりません
        </h3>
        <p className="text-sm md:text-base text-spiritual-lavender text-center max-w-md">
          現在利用可能な占い師がいません。
          <br />
          しばらくしてから再度お試しください。
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* お気に入りフィルター */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setShowFavoriteOnly(false)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            !showFavoriteOnly
              ? 'bg-spiritual-gold text-spiritual-dark'
              : 'bg-spiritual-purple/50 text-gray-300 border border-spiritual-lavender/30'
          }`}
        >
          すべて
        </button>
        <button
          onClick={() => setShowFavoriteOnly(true)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
            showFavoriteOnly
              ? 'bg-spiritual-gold text-spiritual-dark'
              : 'bg-spiritual-purple/50 text-gray-300 border border-spiritual-lavender/30'
          }`}
        >
          お気に入り
        </button>
      </div>

      {/* 占い師カード */}
      <div className="-mx-4 md:mx-0">
        {filteredFortuneTellers.length === 0 ? (
          <div className="text-center py-8 text-spiritual-lavender px-4 md:px-0">
            該当する占い師が見つかりませんでした
          </div>
        ) : (
          filteredFortuneTellers.map((fortuneTeller, index) => {
            const metadata = conversationMetadata[fortuneTeller.id]
            return (
              <div key={fortuneTeller.id}>
                <FortuneTellerCard
                  fortuneTeller={toFortuneTellerCard(fortuneTeller)}
                  isFavorite={favoriteIds.includes(fortuneTeller.id)}
                  onToggleFavorite={handleToggleFavorite}
                  lastMessage={metadata?.last_message_text}
                  lastMessageSender={metadata?.last_message_sender}
                  lastMessageAt={metadata?.last_message_at}
                  unreadCount={metadata?.unread_count || 0}
                />
                {/* ゴージャスな区切り線 */}
                {index < filteredFortuneTellers.length - 1 && (
                  <div className="relative h-[2px] my-2 md:my-3 mx-4 md:mx-0">
                    {/* グラデーション背景 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-spiritual-gold to-transparent opacity-60" />
                    {/* 輝きエフェクト */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-spiritual-accent to-transparent opacity-40 blur-sm" />
                    {/* 装飾ダイヤモンド */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-spiritual-gold rotate-45 shadow-lg shadow-spiritual-gold/50" />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
