'use client'

import Link from 'next/link'
import { Sparkles, Star, Lock } from 'lucide-react'

interface DailyFortuneCardProps {
  fortune: {
    id: string
    overall: string
    fortune_date: string
  } | null
  currentPoints: number
}

/**
 * ホーム画面に表示する今日の運勢カード
 */
export default function DailyFortuneCard({ fortune, currentPoints }: DailyFortuneCardProps) {
  const today = new Date()
  const formattedDate = today.toLocaleDateString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short'
  })

  const FORTUNE_COST = 1000
  const canPurchase = currentPoints >= FORTUNE_COST

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-bold text-gray-900">今日の運勢</h2>
        <span className="text-sm text-gray-600">({formattedDate})</span>
      </div>

      <Link
        href="/daily-fortune"
        className="block"
      >
        {fortune ? (
          // 購入済み：結果のサマリーを表示
          <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* 背景装飾 */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200/30 to-yellow-200/30 rounded-full blur-3xl" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-purple-700">総合運</span>
              </div>

              <p className="text-gray-800 leading-relaxed line-clamp-2 mb-4">
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
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            {/* 背景装飾（キラキラ） */}
            <div className="absolute top-2 right-4">
              <Sparkles className="w-6 h-6 text-white/40 animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-4">
              <Sparkles className="w-4 h-4 text-white/30 animate-pulse delay-100" />
            </div>
            <div className="absolute top-1/2 right-1/3">
              <Star className="w-5 h-5 text-white/20 animate-pulse delay-200" />
            </div>

            <div className="relative text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <Lock className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-white text-lg font-bold mb-2">
                今日の運勢を見る
              </h3>

              <p className="text-white/90 text-sm mb-4 leading-relaxed">
                あなただけの今日一日の運勢を占います
              </p>

              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 text-white font-bold">
                <Sparkles className="w-4 h-4" />
                <span className="text-lg">{FORTUNE_COST.toLocaleString()} pt</span>
              </div>

              {!canPurchase && (
                <p className="text-white/80 text-xs mt-3">
                  ポイントが不足しています
                </p>
              )}
            </div>
          </div>
        )}
      </Link>
    </div>
  )
}
