'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { ChatMessageDisplay } from '@/lib/types/chat'

interface Props {
  message: ChatMessageDisplay
}

/**
 * LINE風メッセージ吹き出しコンポーネント
 *
 * ユーザーメッセージは右側（グレー）、占い師メッセージは左側（紫）に表示
 */
export default function MessageBubble({ message }: Props) {
  const isUser = message.sender_type === 'user'
  const [imageError, setImageError] = useState(false)

  // 日時フォーマット
  const formattedTime = format(new Date(message.created_at), 'HH:mm', { locale: ja })

  return (
    <div className={`flex gap-3 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* アバター */}
      {!isUser && (
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200 bg-spiritual-purple/20 flex items-center justify-center">
            {!imageError && message.sender_avatar ? (
              <Image
                src={message.sender_avatar}
                alt={message.sender_name || '占い師'}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <span className="text-lg font-bold text-spiritual-purple">
                {(message.sender_name || '占')[0]}
              </span>
            )}
          </div>
        </div>
      )}

      {/* メッセージ本体 */}
      <div className={`flex flex-col max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* 送信者名（占い師の場合のみ） */}
        {!isUser && message.sender_name && (
          <span className="text-xs text-gray-600 mb-1 px-1">
            {message.sender_name}
          </span>
        )}

        {/* 吹き出し */}
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-lg transition-all duration-200
            ${isUser
              ? 'bg-gradient-to-br from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-tr-sm hover:shadow-xl hover:scale-[1.02]'
              : 'bg-gradient-to-br from-spiritual-lavender/90 to-spiritual-lavender-light/90 backdrop-blur-sm text-gray-900 rounded-tl-sm border border-spiritual-lavender/30 hover:shadow-xl'
            }
          `}
        >
          <p className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words ${isUser ? 'font-medium' : ''}`}>
            {message.content}
          </p>
        </div>

        {/* タイムスタンプ */}
        <span className={`text-xs text-gray-500 mt-1 px-1`}>
          {formattedTime}
        </span>
      </div>

      {/* ユーザーメッセージ用のスペーサー（アバター位置調整） */}
      {isUser && <div className="w-10 flex-shrink-0" />}
    </div>
  )
}
