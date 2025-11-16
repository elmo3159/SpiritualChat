'use client'

import { Smartphone, Share, Plus, Sparkles, Check } from 'lucide-react'
import { isInstalled, isIOS, resetInstallGuideHidden } from '@/lib/utils/device-detection'
import { useState, useEffect } from 'react'
import Image from 'next/image'

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
        <div className="bg-gradient-to-r from-spiritual-dark/80 to-spiritual-purple/50 rounded-xl p-6 border border-spiritual-lavender/30">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-full">
              <Check className="w-6 h-6 text-spiritual-dark" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-100 mb-2">
                アプリとしてインストール済み
              </h3>
              <p className="text-gray-300 text-sm">
                スピチャをアプリとして快適にご利用いただけます
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-accent/20 rounded-xl p-6 border border-spiritual-lavender/30 relative overflow-hidden">
          {/* アプリアイコンを背景に表示 */}
          <div className="absolute -top-6 -right-6 w-36 h-36 opacity-[0.08]">
            <Image
              src="/icons/icon-192x192.png"
              alt="スピチャアイコン"
              width={144}
              height={144}
              className="object-cover w-full h-full"
            />
          </div>

          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold rounded-full shadow-lg flex-shrink-0">
              <Smartphone className="w-6 h-6 text-spiritual-dark" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-100 mb-2">
                アプリ化でもっと便利に！
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                スピチャをホーム画面に追加して、アプリのように使いましょう
              </p>
              <ul className="space-y-1.5 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-spiritual-gold" />
                  <span>ホーム画面から即アクセス</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-spiritual-gold" />
                  <span>フルスクリーン表示で快適</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-spiritual-gold" />
                  <span>プッシュ通知を受け取れる</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 flex-shrink-0 text-spiritual-gold" />
                  <span>起動が速く、サクサク動作</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* インストール手順（iOSの場合のみ表示） */}
      {isIOSDevice && !isPWAInstalled && (
        <div className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl p-6 border border-spiritual-lavender/30">
          {/* アプリアイコンプレビュー */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-spiritual-gold/30 flex-shrink-0">
              <Image
                src="/icons/icon-192x192.png"
                alt="スピチャアプリアイコン"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-100 flex items-center gap-2">
                <span className="text-2xl">📱</span>
                iPhoneでのインストール手順
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                このアイコンがホーム画面に追加されます
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* ステップ1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-100 mb-3">
                  画面下部の共有ボタンをタップ
                </p>
                <div className="flex items-center gap-3 p-4 bg-spiritual-dark/50 rounded-lg border border-spiritual-lavender/20">
                  <div className="p-2 bg-spiritual-purple/30 rounded-lg shadow">
                    <Share className="w-7 h-7 text-spiritual-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">共有アイコン</p>
                    <p className="text-xs text-gray-400">四角に上向き矢印のアイコンです</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-100 mb-3">
                  「ホーム画面に追加」を選択
                </p>
                <div className="flex items-center gap-3 p-4 bg-spiritual-dark/50 rounded-lg border border-spiritual-lavender/20">
                  <div className="p-2 bg-spiritual-purple/30 rounded-lg shadow">
                    <Plus className="w-7 h-7 text-spiritual-gold" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-200">ホーム画面に追加</p>
                    <p className="text-xs text-gray-400">メニューを下にスクロールすると見つかります</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ステップ3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-100 mb-3">
                  「追加」ボタンをタップして完了
                </p>
                <div className="p-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-lg text-center font-bold text-lg shadow-lg">
                  追加
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  ホーム画面にスピチャのアイコンが追加されます
                </p>
              </div>
            </div>
          </div>

          {/* 重要なお知らせ */}
          <div className="mt-6 p-4 bg-spiritual-purple/20 border border-spiritual-gold/30 rounded-lg">
            <p className="text-sm text-gray-300 flex items-start gap-2">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <span>
                <strong className="text-spiritual-gold">Safari</strong>ブラウザからアクセスしてください。ChromeやLINEアプリ内ブラウザからはインストールできません。
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Androidの場合 */}
      {!isIOSDevice && !isPWAInstalled && (
        <div className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl p-6 border border-spiritual-lavender/30">
          {/* アプリアイコンプレビュー */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-spiritual-gold/30 flex-shrink-0">
              <Image
                src="/icons/icon-192x192.png"
                alt="スピチャアプリアイコン"
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <h3 className="font-bold text-gray-100 flex items-center gap-2">
                <span className="text-2xl">📱</span>
                Androidでのインストール手順
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                このアイコンがホーム画面に追加されます
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 leading-relaxed">
              ChromeブラウザでアクセスしているAndroidユーザーの場合、画面上部や下部に「ホーム画面に追加」のメッセージが表示されます。
            </p>

            <div className="p-4 bg-spiritual-purple/20 rounded-lg border border-spiritual-gold/30">
              <p className="text-sm text-gray-300 leading-relaxed">
                メッセージが表示されない場合は、ブラウザのメニュー（︙）から<strong className="text-spiritual-gold">「ホーム画面に追加」</strong>または<strong className="text-spiritual-gold">「アプリをインストール」</strong>を選択してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ガイド再表示ボタン */}
      {isIOSDevice && !isPWAInstalled && (
        <button
          onClick={handleResetGuide}
          className="w-full px-6 py-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-xl font-bold hover:shadow-lg hover:shadow-spiritual-gold/30 transition-all duration-300 hover:scale-[1.02] active:scale-95"
        >
          インストールガイドを再表示する
        </button>
      )}
    </div>
  )
}
