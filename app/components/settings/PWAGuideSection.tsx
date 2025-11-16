'use client'

import { Smartphone, Share, Plus, Sparkles, Check } from 'lucide-react'
import { isInstalled, isIOS, resetInstallGuideHidden } from '@/lib/utils/device-detection'
import { useState, useEffect } from 'react'

export default function PWAGuideSection() {
  const [isPWAInstalled, setIsPWAInstalled] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)

  useEffect(() => {
    setIsPWAInstalled(isInstalled())
    setIsIOSDevice(isIOS())
  }, [])

  const handleResetGuide = () => {
    resetInstallGuideHidden()
    alert('インストールガイドの非表示設定をリセットしました。次回占い師選択ページでガイドが表示されます。')
  }

  return (
    <div className="space-y-6">
      {/* ステータス表示 */}
      {isPWAInstalled ? (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-500 rounded-full">
              <Check className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-900 mb-2">
                アプリとしてインストール済み
              </h3>
              <p className="text-green-700 text-sm">
                スピチャをアプリとして快適にご利用いただけます
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-900 mb-2">
                アプリ化でもっと便利に！
              </h3>
              <p className="text-purple-700 text-sm mb-3">
                スピチャをホーム画面に追加して、アプリのように使いましょう
              </p>
              <ul className="space-y-1.5 text-sm text-purple-800">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>ホーム画面から即アクセス</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>フルスクリーン表示で快適</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>プッシュ通知を受け取れる</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>起動が速く、サクサク動作</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* インストール手順（iOSの場合のみ表示） */}
      {isIOSDevice && !isPWAInstalled && (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📱</span>
            iPhoneでのインストール手順
          </h3>

          <div className="space-y-5">
            {/* ステップ1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-3">
                  画面下部の共有ボタンをタップ
                </p>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                  <div className="p-2 bg-white rounded-lg shadow">
                    <Share className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">共有アイコン</p>
                    <p className="text-xs text-blue-700">四角に上向き矢印のアイコンです</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-3">
                  「ホーム画面に追加」を選択
                </p>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border-2 border-gray-300">
                  <div className="p-2 bg-white rounded-lg shadow">
                    <Plus className="w-7 h-7 text-gray-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ホーム画面に追加</p>
                    <p className="text-xs text-gray-600">メニューを下にスクロールすると見つかります</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-3">
                  「追加」ボタンをタップして完了
                </p>
                <div className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg text-center font-bold text-lg shadow-lg">
                  追加
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ホーム画面にスピチャのアイコンが追加されます
                </p>
              </div>
            </div>
          </div>

          {/* 重要なお知らせ */}
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <span>
                <strong>Safari</strong>ブラウザからアクセスしてください。ChromeやLINEアプリ内ブラウザからはインストールできません。
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Androidの場合 */}
      {!isIOSDevice && !isPWAInstalled && (
        <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📱</span>
            Androidでのインストール手順
          </h3>

          <div className="space-y-4">
            <p className="text-gray-700">
              ChromeブラウザでアクセスしているAndroidユーザーの場合、画面上部や下部に「ホーム画面に追加」のメッセージが表示されます。
            </p>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
              <p className="text-sm text-green-800">
                メッセージが表示されない場合は、ブラウザのメニュー（︙）から「ホーム画面に追加」または「アプリをインストール」を選択してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ガイド再表示ボタン */}
      {isIOSDevice && !isPWAInstalled && (
        <button
          onClick={handleResetGuide}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-shadow"
        >
          インストールガイドを再表示する
        </button>
      )}
    </div>
  )
}
