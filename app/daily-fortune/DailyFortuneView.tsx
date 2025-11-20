'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles, Star, Palette, Gift, Zap, Loader2 } from 'lucide-react'
import { purchaseDailyFortune } from '@/app/actions/daily-fortune'
import Link from 'next/link'

interface Fortune {
  id: string
  overall_stars: number | null
  overall: string
  focus_area: string
  advice: string
  lucky_color: string | null
  lucky_item: string | null
  lucky_action: string | null
  fortune_date: string
}

interface DailyFortuneViewProps {
  fortune: Fortune | null
  currentPoints: number
  today: string
}

export default function DailyFortuneView({ fortune, currentPoints, today }: DailyFortuneViewProps) {
  const router = useRouter()
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState('')

  const FORTUNE_COST = 1000
  const canPurchase = currentPoints >= FORTUNE_COST

  const formattedDate = new Date(today).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const handlePurchase = async () => {
    if (!canPurchase) {
      router.push('/points/purchase')
      return
    }

    setIsPurchasing(true)
    setError('')

    const result = await purchaseDailyFortune()

    if (result.error) {
      setError(result.error)
      setIsPurchasing(false)
    } else {
      // 成功したらページをリロードして結果を表示
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-20">
      {/* ヘッダー */}
      <div className="bg-spiritual-dark/95 backdrop-blur-lg border-b border-spiritual-lavender/30 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-spiritual-purple/50 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-spiritual-lavender" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-100">今日の運勢</h1>
            <p className="text-sm text-spiritual-lavender">{formattedDate}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {fortune ? (
          // 運勢結果を表示
          <div className="space-y-6">
            {/* 総合運 */}
            <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-spiritual-lavender/30">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-spiritual-gold" />
                <h2 className="text-lg font-bold text-gray-100">総合運</h2>
              </div>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-6 h-6 ${
                      star <= (fortune.overall_stars || 3)
                        ? 'fill-spiritual-gold text-spiritual-gold'
                        : 'text-spiritual-lavender/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-spiritual-lavender leading-relaxed whitespace-pre-wrap">
                {fortune.overall}
              </p>
            </div>

            {/* 重点運勢 */}
            <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-spiritual-lavender/30">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-spiritual-accent" />
                <h2 className="text-lg font-bold text-gray-100">重点運勢</h2>
              </div>
              <p className="text-spiritual-lavender leading-relaxed whitespace-pre-wrap">
                {fortune.focus_area}
              </p>
            </div>

            {/* 今日の心構え */}
            <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-spiritual-lavender/30">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-spiritual-gold" />
                <h2 className="text-lg font-bold text-gray-100">今日の心構え</h2>
              </div>
              <p className="text-spiritual-lavender leading-relaxed whitespace-pre-wrap">
                {fortune.advice}
              </p>
            </div>

            {/* ラッキーポイント */}
            <div className="bg-gradient-to-br from-spiritual-gold/20 to-spiritual-accent/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-spiritual-gold/30">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-6 h-6 text-spiritual-gold" />
                <h2 className="text-lg font-bold text-gray-100">ラッキーポイント</h2>
              </div>
              <div className="space-y-3">
                {fortune.lucky_color && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-spiritual-gold/20 rounded-full shadow-sm border border-spiritual-gold/30">
                      <Palette className="w-5 h-5 text-spiritual-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-spiritual-lavender/70">ラッキーカラー</p>
                      <p className="text-gray-100 font-medium">{fortune.lucky_color}</p>
                    </div>
                  </div>
                )}
                {fortune.lucky_item && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-spiritual-gold/20 rounded-full shadow-sm border border-spiritual-gold/30">
                      <Gift className="w-5 h-5 text-spiritual-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-spiritual-lavender/70">ラッキーアイテム</p>
                      <p className="text-gray-100 font-medium">{fortune.lucky_item}</p>
                    </div>
                  </div>
                )}
                {fortune.lucky_action && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-spiritual-gold/20 rounded-full shadow-sm border border-spiritual-gold/30">
                      <Sparkles className="w-5 h-5 text-spiritual-gold" />
                    </div>
                    <div>
                      <p className="text-xs text-spiritual-lavender/70">ラッキー行動</p>
                      <p className="text-gray-100 font-medium">{fortune.lucky_action}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 占い師に相談するボタン */}
            <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-spiritual-lavender/30 text-center">
              <p className="text-sm text-spiritual-lavender mb-4">
                もっと詳しく知りたい方は
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark px-6 py-3 rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                占い師に相談する
              </Link>
            </div>
          </div>
        ) : (
          // 購入画面
          <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-spiritual-lavender/30 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-spiritual-gold/30 to-spiritual-accent/30 rounded-full mb-6 border border-spiritual-gold/30">
              <Sparkles className="w-10 h-10 text-spiritual-gold" />
            </div>

            <h2 className="text-2xl font-bold text-gray-100 mb-3">
              今日の運勢を占う
            </h2>

            <p className="text-spiritual-lavender mb-6 leading-relaxed">
              あなたのプロフィールと過去の相談内容をもとに、<br />
              今日一日の運勢とエネルギーの流れを詳しく占います
            </p>

            <div className="bg-spiritual-accent/10 rounded-xl p-4 mb-6 border border-spiritual-accent/30">
              <p className="text-sm text-spiritual-lavender leading-relaxed">
                <span className="font-semibold text-spiritual-gold">1日1回限定</span>で占えます。<br />
                毎日<span className="font-semibold text-spiritual-gold">0:00</span>を過ぎると、新しい1日の運勢を占うことができます。
              </p>
            </div>

            <div className="bg-gradient-to-br from-spiritual-gold/20 to-spiritual-accent/20 rounded-xl p-4 mb-6 border border-spiritual-gold/30">
              <p className="text-sm text-spiritual-lavender/70 mb-2">必要ポイント</p>
              <p className="text-3xl font-bold text-spiritual-gold">
                {FORTUNE_COST.toLocaleString()} pt
              </p>
            </div>

            <div className="bg-spiritual-dark/30 rounded-xl p-4 mb-6 text-left border border-spiritual-lavender/20">
              <p className="text-sm font-medium text-gray-100 mb-2">占いの内容</p>
              <ul className="space-y-2 text-sm text-spiritual-lavender">
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-0.5">✓</span>
                  <span>総合運 - 今日一日の全体的な流れ</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-0.5">✓</span>
                  <span>重点運勢 - あなたの悩みに特化した運勢</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-0.5">✓</span>
                  <span>今日の心構え - 意識すると良いこと</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-spiritual-gold mt-0.5">✓</span>
                  <span>ラッキーポイント - 色・アイテム・行動</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className={`w-full py-4 rounded-full font-bold transition-all ${
                  canPurchase
                    ? 'bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark hover:shadow-xl hover:scale-105'
                    : 'bg-spiritual-dark/50 text-spiritual-lavender/50 cursor-not-allowed border border-spiritual-lavender/20'
                }`}
              >
                {isPurchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    占い中...
                  </span>
                ) : canPurchase ? (
                  `今日の運勢を見る（${FORTUNE_COST.toLocaleString()} pt）`
                ) : (
                  'ポイントが不足しています'
                )}
              </button>

              {!canPurchase && (
                <Link
                  href="/points/purchase"
                  className="w-full py-4 rounded-full font-bold bg-spiritual-purple/50 text-gray-100 hover:bg-spiritual-purple/70 transition-all border border-spiritual-lavender/30"
                >
                  ポイントを追加する
                </Link>
              )}
            </div>

            <p className="text-xs text-spiritual-lavender/70 mt-4">
              現在の残高: {currentPoints.toLocaleString()} pt
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
