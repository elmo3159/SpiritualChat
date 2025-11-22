'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Sparkles, Star as StarIcon } from 'lucide-react'
import FortuneTellerList from './fortune-tellers/FortuneTellerList'
import type { FortuneTeller } from '@/lib/types/fortune-teller'
import Link from 'next/link'
import IOSInstallGuide from './pwa/IOSInstallGuide'
import WelcomePopup from './welcome/WelcomePopup'
import {
  shouldShowIOSInstallGuide,
  isInstallGuideHidden,
} from '@/lib/utils/device-detection'

interface HomeTabViewProps {
  fortuneTellers: FortuneTeller[]
  fortune: {
    id: string
    overall: string
    fortune_date: string
  } | null
  currentPoints: number
  today: string
  hasUnlockedDivination: boolean
  isNewUser: boolean
}

type Tab = 'chat' | 'fortune'

export default function HomeTabView({
  fortuneTellers,
  fortune,
  currentPoints,
  today,
  hasUnlockedDivination,
  isNewUser,
}: HomeTabViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [showInstallGuide, setShowInstallGuide] = useState(false)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)

  useEffect(() => {
    // チャットタブで、鑑定結果開封済み、iOS、未インストール、非表示設定なしの場合にガイド表示
    if (
      activeTab === 'chat' &&
      hasUnlockedDivination &&
      shouldShowIOSInstallGuide() &&
      !isInstallGuideHidden()
    ) {
      // 少し遅延させてから表示（UX向上）
      const timer = setTimeout(() => {
        setShowInstallGuide(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [activeTab, hasUnlockedDivination])

  useEffect(() => {
    // 新規ユーザーで、チャットタブで、まだウェルカムポップアップを表示していない場合
    if (activeTab === 'chat' && isNewUser) {
      const hasShownWelcome = localStorage.getItem('welcome-popup-shown')
      if (!hasShownWelcome) {
        // 少し遅延させてから表示（UX向上）
        const timer = setTimeout(() => {
          setShowWelcomePopup(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [activeTab, isNewUser])

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false)
    localStorage.setItem('welcome-popup-shown', 'true')
  }

  const formattedDate = new Date(today).toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  })

  return (
    <div>
      {/* タブ切り替えボタン */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark text-white shadow-lg'
              : 'bg-white/70 text-gray-700 border border-spiritual-pink/30 hover:bg-white/90'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>チャット占い</span>
        </button>
        <button
          onClick={() => setActiveTab('fortune')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeTab === 'fortune'
              ? 'bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark text-white shadow-lg'
              : 'bg-white/70 text-gray-700 border border-spiritual-pink/30 hover:bg-white/90'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>今日の運勢</span>
        </button>
      </div>

      {/* タブコンテンツ */}
      {activeTab === 'chat' ? (
        <div>
          {/* タイトルセクション */}
          <div className="text-center mb-6 md:mb-10 space-y-1 md:space-y-3">
            <h2 className="text-xl md:text-3xl lg:text-4xl font-bold text-white drop-shadow-lg">
              占い師を選ぶ
            </h2>
            <p className="text-xs md:text-base text-white drop-shadow-md">
              あなたの悩みに寄り添う占い師とチャットしましょう
            </p>
          </div>

          {/* 占い師一覧 */}
          <FortuneTellerList fortuneTellers={fortuneTellers} />
        </div>
      ) : (
        <div>
          {/* 今日の運勢セクション */}
          <div className="text-center mb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              今日の運勢
            </h2>
            <p className="text-sm text-white drop-shadow-md">
              {formattedDate}
            </p>
          </div>

          <Link href="/daily-fortune" className="block">
            {fortune ? (
              // 購入済み：結果のサマリーを表示
              <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 md:p-8 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* 背景装飾 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl" />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={`w-5 h-5 ${
                            star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-purple-700">総合運</span>
                  </div>

                  <p className="text-gray-800 leading-relaxed mb-6">
                    {fortune.overall}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-600 font-medium">
                      詳細を見る →
                    </span>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Sparkles className="w-3 h-3" />
                      <span>運勢診断済み</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // 未購入：購入を促すカード
              <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* 背景装飾（キラキラ） */}
                <div className="absolute top-4 right-6">
                  <Sparkles className="w-8 h-8 text-white/40 animate-pulse" />
                </div>
                <div className="absolute bottom-6 left-6">
                  <Sparkles className="w-5 h-5 text-white/30 animate-pulse delay-100" />
                </div>
                <div className="absolute top-1/2 right-1/3">
                  <StarIcon className="w-6 h-6 text-white/20 animate-pulse delay-200" />
                </div>

                <div className="relative text-center py-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>

                  <h3 className="text-white text-2xl font-bold mb-3">
                    今日の運勢を見る
                  </h3>

                  <p className="text-white/90 mb-4 leading-relaxed max-w-md mx-auto">
                    あなただけの今日一日の運勢とエネルギーの流れを詳しく占います
                  </p>

                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4 max-w-sm mx-auto">
                    <p className="text-white/90 text-sm leading-relaxed">
                      <span className="font-semibold text-yellow-300">1日1回限定</span>で占えます<br />
                      毎日<span className="font-semibold text-yellow-300">0:00</span>を過ぎると新しい運勢を占えます
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-white font-bold text-lg">
                    <Sparkles className="w-5 h-5" />
                    <span>1,000 pt</span>
                  </div>

                  {currentPoints < 1000 && (
                    <p className="text-white/80 text-sm mt-4">
                      ポイントが不足しています
                    </p>
                  )}
                </div>
              </div>
            )}
          </Link>
        </div>
      )}

      {/* PWAインストールガイド */}
      {showInstallGuide && (
        <IOSInstallGuide onClose={() => setShowInstallGuide(false)} />
      )}

      {/* ウェルカムポップアップ */}
      {showWelcomePopup && (
        <WelcomePopup points={1000} onClose={handleCloseWelcomePopup} />
      )}
    </div>
  )
}
