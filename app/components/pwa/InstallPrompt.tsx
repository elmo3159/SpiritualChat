'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

/**
 * PWAインストールプロンプトコンポーネント
 *
 * ユーザーにPWAをホーム画面に追加するよう促すバナーを表示
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // インストール済みかチェック
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches
    if (isInstalled) {
      return
    }

    // 以前に却下されたかチェック
    const dismissedAt = localStorage.getItem('pwa-install-dismissed')
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10)
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      // 7日間は再表示しない
      if (daysSinceDismissed < 7) {
        return
      }
    }

    const handler = (e: Event) => {
      // デフォルトのインストールプロンプトを防ぐ
      e.preventDefault()
      // 後で使用するためにイベントを保存
      setDeferredPrompt(e)
      // カスタムプロンプトを表示
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return
    }

    // インストールプロンプトを表示
    deferredPrompt.prompt()

    // ユーザーの選択を待つ
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // イベントを使い終わったのでクリア
    setDeferredPrompt(null)
    setShowPrompt(false)

    // インストール状況をトラッキング
    if (outcome === 'accepted') {
      localStorage.setItem('pwa-installed', 'true')
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // 却下した日時を記録
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-up">
      <div className="bg-gradient-to-br from-spiritual-dark/95 to-spiritual-purple/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-spiritual-lavender/30 overflow-hidden">
        {/* ヘッダー */}
        <div className="relative p-4 pb-3">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-spiritual-purple/50 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-spiritual-accent to-spiritual-gold rounded-xl flex items-center justify-center">
              <Download className="w-6 h-6 text-spiritual-dark" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">アプリをインストール</h3>
              <p className="text-spiritual-lavender text-xs">ホーム画面に追加</p>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="px-4 pb-3">
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            スピチャをホーム画面に追加して、いつでも簡単にアクセスできます。
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-start gap-2 text-xs text-spiritual-lavender">
              <span className="text-spiritual-gold">✓</span>
              <span>オフラインでも閲覧可能</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-spiritual-lavender">
              <span className="text-spiritual-gold">✓</span>
              <span>プッシュ通知で最新情報をお届け</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-spiritual-lavender">
              <span className="text-spiritual-gold">✓</span>
              <span>より速く、よりスムーズに</span>
            </div>
          </div>

          {/* ボタン */}
          <div className="flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 px-4 py-2.5 rounded-xl border border-spiritual-lavender/30 text-gray-300 text-sm font-medium hover:bg-spiritual-purple/30 transition-all"
            >
              後で
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark text-sm font-bold hover:shadow-lg hover:shadow-spiritual-gold/30 transition-all"
            >
              インストール
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
