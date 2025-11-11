'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Menu, History, X } from 'lucide-react'

interface Props {
  /**
   * 占い師ID
   */
  fortuneTellerId: string
}

/**
 * チャットヘッダーメニューコンポーネント
 *
 * ハンバーガーメニューボタンとドロップダウンメニューを表示します
 */
export default function ChatHeaderMenu({ fortuneTellerId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // メニュー外をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={menuRef}>
      {/* ハンバーガーメニューボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
        aria-label="メニューを開く"
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white" />
        ) : (
          <Menu className="w-5 h-5 text-white" />
        )}
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200"
        >
            <div className="py-2">
              {/* 鑑定履歴 */}
              <Link
                href={`/chat/${fortuneTellerId}/history`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
              >
                <History className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    鑑定履歴を見る
                  </p>
                  <p className="text-xs text-gray-500">
                    過去の鑑定結果を振り返る
                  </p>
                </div>
              </Link>
            </div>
        </div>
      )}
    </div>
  )
}
