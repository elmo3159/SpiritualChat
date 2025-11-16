'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'

interface Props {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * LINE風メッセージ入力コンポーネント
 *
 * 画面下部に固定され、メッセージの入力と送信を行います
 */
export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'メッセージを入力...',
}: Props) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !disabled) {
      onSend(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift+Enterで改行、Enterのみで送信
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-shrink-0 border-t border-spiritual-purple/30 bg-spiritual-dark/95 backdrop-blur-lg px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg"
    >
      <div className="flex items-end gap-2 md:gap-3 max-w-3xl mx-auto">
        {/* テキストエリア */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="
            flex-1 resize-none rounded-2xl border border-spiritual-lavender/40
            px-4 py-1.5 text-base md:text-sm text-gray-100 bg-spiritual-purple/50 backdrop-blur-sm
            focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60
            disabled:bg-spiritual-purple/20 disabled:cursor-not-allowed disabled:text-gray-500
            placeholder:text-xs md:placeholder:text-sm placeholder:text-gray-400 placeholder:leading-tight
            max-h-32 transition-all duration-200 leading-tight overflow-hidden
          "
          style={{
            minHeight: '40px',
            height: 'auto',
          }}
        />

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="
            flex-shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-full
            bg-gradient-to-br from-spiritual-accent to-spiritual-gold
            text-spiritual-dark
            flex items-center justify-center
            transition-all duration-200
            hover:shadow-lg hover:shadow-spiritual-gold/30 hover:scale-105
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
            active:scale-95
            border border-spiritual-gold/30
          "
        >
          <Send className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>
    </form>
  )
}
