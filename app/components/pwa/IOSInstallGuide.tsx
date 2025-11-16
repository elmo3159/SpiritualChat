'use client'

import { useState, useEffect } from 'react'
import { X, Share, Plus, Smartphone, Sparkles } from 'lucide-react'
import { setInstallGuideHidden } from '@/lib/utils/device-detection'

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
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* モーダル */}
      <div className="relative w-full max-w-lg mx-4 mb-4 sm:mb-0 bg-gradient-to-b from-purple-50 to-white rounded-2xl shadow-2xl overflow-hidden">
        {/* ヘッダー */}
        <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-full">
              <Smartphone className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold">アプリをホーム画面に追加</h2>
          </div>
          <p className="text-purple-100 text-sm">
            スピチャをアプリのように使えます
          </p>
        </div>

        {/* コンテンツ */}
        <div className="p-6 space-y-6">
          {/* メリット */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-600 rounded-full">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 mb-2">
                  アプリ化のメリット
                </h3>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>✨ ホーム画面から即アクセス</li>
                  <li>📱 フルスクリーン表示で快適</li>
                  <li>🔔 プッシュ通知を受け取れる</li>
                  <li>⚡ 起動が速く、サクサク動作</li>
                </ul>
              </div>
            </div>
          </div>

          {/* インストール手順 */}
          <div>
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-purple-600">📍</span>
              インストール手順
            </h3>

            <div className="space-y-4">
              {/* ステップ1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    画面下部の共有ボタンをタップ
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border-2 border-purple-200">
                    <Share className="w-6 h-6 text-blue-500" />
                    <span className="text-sm text-gray-600">
                      このアイコンをタップ
                    </span>
                  </div>
                </div>
              </div>

              {/* ステップ2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    「ホーム画面に追加」を選択
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border-2 border-purple-200">
                    <Plus className="w-6 h-6 text-gray-700" />
                    <span className="text-sm text-gray-600">
                      メニューから選んでください
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    ※ 下にスクロールすると見つかります
                  </p>
                </div>
              </div>

              {/* ステップ3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-2">
                    「追加」ボタンをタップして完了
                  </p>
                  <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-center font-medium">
                    追加
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* チェックボックス */}
          <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="mt-1 w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              今後このメッセージを表示しない
            </span>
          </label>

          {/* ボタン */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-xl font-bold hover:bg-purple-50 transition-colors"
            >
              後で
            </button>
            <button
              onClick={handleClose}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-shadow"
            >
              わかりました
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
