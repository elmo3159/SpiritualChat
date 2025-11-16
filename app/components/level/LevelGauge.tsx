'use client'

import { Sparkles, TrendingUp } from 'lucide-react'

interface LevelGaugeProps {
  currentLevel: number
  currentExp: number
  expForNextLevel: number
  expToNextLevel: number
  progressPercentage: number
  title?: string
  compact?: boolean
}

/**
 * レベルゲージコンポーネント
 * ユーザーの現在のレベルと次のレベルまでの進捗を表示
 */
export default function LevelGauge({
  currentLevel,
  currentExp,
  expForNextLevel,
  expToNextLevel,
  progressPercentage,
  title,
  compact = false,
}: LevelGaugeProps) {
  // レベルに応じた色グラデーション
  const getLevelGradient = (level: number) => {
    if (level >= 100) return 'from-yellow-400 to-orange-500'
    if (level >= 50) return 'from-purple-500 to-pink-500'
    if (level >= 25) return 'from-blue-500 to-cyan-500'
    return 'from-green-500 to-emerald-500'
  }

  // レベルに応じた称号
  const getLevelTitle = (level: number) => {
    if (level >= 100) return '伝説の占い師'
    if (level >= 90) return '運命の織り手'
    if (level >= 75) return '神秘の求道者'
    if (level >= 65) return '天界の使者'
    if (level >= 55) return '霊視の賢者'
    if (level >= 45) return '聖なる導き手'
    if (level >= 35) return '運命の探究者'
    if (level >= 30) return '神託の受け手'
    if (level >= 25) return '占いの達人'
    if (level >= 20) return '星詠みの賢者'
    if (level >= 15) return 'タロットの使い手'
    if (level >= 11) return '占いの修行者'
    if (level >= 8) return '月の探究者'
    if (level >= 5) return '占い初級者'
    if (level >= 3) return '星見習い'
    return '占いの門下生'
  }

  const gradient = getLevelGradient(currentLevel)
  const levelTitle = title || getLevelTitle(currentLevel)

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* レベル表示 */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg border-2 border-white/30`}>
          <div className="text-center">
            <p className="text-xs font-semibold text-white/80 leading-none">Lv</p>
            <p className="text-lg font-bold text-white leading-none">{currentLevel}</p>
          </div>
        </div>

        {/* 進捗バー */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-medium text-spiritual-lavender truncate">
              {levelTitle}
            </p>
            <p className="text-xs text-spiritual-lavender/70">
              {Math.floor(progressPercentage)}%
            </p>
          </div>
          <div className="relative h-2 bg-spiritual-dark/50 rounded-full overflow-hidden border border-spiritual-lavender/20">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30 shadow-lg">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-spiritual-gold" />
          <h3 className="text-base md:text-lg font-bold text-white">
            レベル
          </h3>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-xs md:text-sm font-bold shadow-md`}>
          {levelTitle}
        </div>
      </div>

      {/* レベル表示とゲージ */}
      <div className="flex items-center gap-4 mb-3">
        {/* レベルアイコン */}
        <div className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-xl border-4 border-white/20 relative`}>
          <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
          <div className="text-center relative z-10">
            <p className="text-xs md:text-sm font-semibold text-white/90 leading-none">Lv</p>
            <p className="text-2xl md:text-3xl font-bold text-white leading-none mt-0.5">{currentLevel}</p>
          </div>
        </div>

        {/* 経験値情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-spiritual-gold" />
              <p className="text-xs md:text-sm font-medium text-spiritual-lavender">
                経験値
              </p>
            </div>
            <p className="text-xs md:text-sm font-bold text-white">
              {currentExp.toLocaleString()} / {expForNextLevel.toLocaleString()}
            </p>
          </div>

          {/* 進捗バー */}
          <div className="relative h-4 md:h-5 bg-spiritual-dark/50 rounded-full overflow-hidden border border-spiritual-lavender/30 shadow-inner">
            <div
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${gradient} rounded-full transition-all duration-700 ease-out`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            >
              {/* アニメーション効果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>

            {/* パーセンテージ表示 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-lg">
                {Math.floor(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* 次のレベルまで */}
          <div className="mt-2 text-center">
            <p className="text-xs text-spiritual-lavender/70">
              次のレベルまで <span className="font-semibold text-spiritual-gold">{expToNextLevel.toLocaleString()}</span> EXP
            </p>
          </div>
        </div>
      </div>

      {/* レベルボーナス情報 */}
      <div className="mt-4 pt-4 border-t border-spiritual-lavender/20">
        <p className="text-xs text-spiritual-lavender/80 text-center">
          💡 ポイントを使用して経験値を獲得し、レベルアップしよう！
        </p>
      </div>
    </div>
  )
}
