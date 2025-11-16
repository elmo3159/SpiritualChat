'use client'

import { useState } from 'react'
import { X, Share, Plus } from 'lucide-react'
import { setInstallGuideHidden } from '@/lib/utils/device-detection'
import Image from 'next/image'

interface IOSInstallGuideProps {
  onClose: () => void
}

export default function IOSInstallGuide({ onClose }: IOSInstallGuideProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      setInstallGuideHidden()
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pb-20">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* モーダル */}
      <div className="relative w-full max-w-lg mx-4 bg-gradient-to-b from-purple-50 to-white rounded-2xl shadow-2xl overflow-hidden max-h-[75vh] flex flex-col">
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg overflow-hidden shadow-md border-2 border-white/30">
              <Image
                src="/icons/icon-192x192.png"
                alt="スピチャ"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-base font-bold">ホーム画面に追加</h2>
              <p className="text-purple-100 text-xs">アプリのように使える</p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {/* メリット */}
          <div className="bg-purple-50 rounded-lg p-2">
            <div className="grid grid-cols-2 gap-1 text-xs text-purple-900">
              <div className="flex items-center gap-1">
                <span>📱</span>
                <span>全画面表示</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🔔</span>
                <span>通知が届く</span>
              </div>
              <div className="flex items-center gap-1">
                <span>⚡</span>
                <span>即アクセス</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✨</span>
                <span>快適動作</span>
              </div>
            </div>
          </div>

          {/* インストール手順 */}
          <div className="space-y-2">
            {/* ステップ1 */}
            <div className="flex gap-2 items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  <Share className="w-4 h-4 inline text-blue-500 mr-1" />
                  共有ボタンをタップ
                </p>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="flex gap-2 items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  <Plus className="w-4 h-4 inline text-gray-700 mr-1" />
                  「ホーム画面に追加」
                </p>
                <p className="text-xs text-gray-500">
                  ※下にスクロール
                </p>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="flex gap-2 items-start">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  「追加」をタップ
                </p>
              </div>
            </div>
          </div>

          {/* チェックボックス */}
          <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <span className="text-xs text-gray-700">
              今後表示しない
            </span>
          </label>

          {/* ボタン */}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-white border border-purple-600 text-purple-600 rounded-lg text-sm font-bold hover:bg-purple-50"
            >
              後で
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
