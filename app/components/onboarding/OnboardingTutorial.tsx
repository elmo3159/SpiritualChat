'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, ChevronRight, ChevronLeft, Sparkles, Heart, Bell, Coins, MessageCircle } from 'lucide-react'

interface OnboardingStep {
  title: string
  description: string
  icon: React.ReactNode
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'スピチャへようこそ',
    description: 'AI占い師とチャットして、あなたの悩みを解決しましょう。このチュートリアルで基本的な使い方をご紹介します。',
    icon: <Sparkles className="w-16 h-16 text-spiritual-gold" />,
  },
  {
    title: '占い師を選ぶ',
    description: 'ホーム画面から気になる占い師を選んでタップすると、チャットが始まります。占い師はそれぞれ得意分野が異なります。',
    icon: <MessageCircle className="w-16 h-16 text-spiritual-accent" />,
  },
  {
    title: 'お気に入り機能',
    description: '占い師カードの右上にあるハートアイコンをタップすると、お気に入りに追加できます。お気に入りの占い師は上部に表示されます。',
    icon: <Heart className="w-16 h-16 text-red-500 fill-red-500" />,
  },
  {
    title: 'ポイントについて',
    description: '鑑定結果の全文を読むには500ポイントが必要です。ヘッダーのポイント表示や+ボタン、ボトムナビから購入できます。',
    icon: <Coins className="w-16 h-16 text-spiritual-gold" />,
  },
  {
    title: '通知機能',
    description: 'ヘッダーのベルアイコンから通知を確認できます。新しい鑑定結果やメッセージが届いたときに通知されます。',
    icon: <Bell className="w-16 h-16 text-spiritual-lavender" />,
  },
]

/**
 * オンボーディングチュートリアルコンポーネント
 *
 * 初回ユーザーに対してアプリの使い方を説明するモーダル
 */
export default function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // オンボーディング完了状態をチェック
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (profile && !profile.onboarding_completed) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error('オンボーディング状態確認エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  // オンボーディング完了処理
  const completeOnboarding = async () => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      setIsOpen(false)
    } catch (error) {
      console.error('オンボーディング完了エラー:', error)
    }
  }

  // 次へ
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      completeOnboarding()
    }
  }

  // 戻る
  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  // スキップ
  const handleSkip = () => {
    completeOnboarding()
  }

  if (isLoading || !isOpen) {
    return null
  }

  const step = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* オーバーレイ */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* モーダル */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-spiritual-dark via-spiritual-purple to-spiritual-dark border-2 border-spiritual-gold/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-spiritual-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-spiritual-accent/20 rounded-full blur-3xl" />

        {/* ヘッダー */}
        <div className="relative p-6 border-b border-spiritual-lavender/30">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* プログレスバー */}
          <div className="flex items-center gap-2 mb-4">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-spiritual-gold'
                    : 'bg-spiritual-lavender/30'
                }`}
              />
            ))}
          </div>

          <p className="text-xs text-spiritual-lavender text-center">
            {currentStep + 1} / {ONBOARDING_STEPS.length}
          </p>
        </div>

        {/* コンテンツ */}
        <div className="relative p-8 text-center">
          {/* アイコン */}
          <div className="mb-6 flex justify-center animate-in zoom-in duration-500">
            {step.icon}
          </div>

          {/* タイトル */}
          <h2 className="text-2xl font-bold text-white mb-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
            {step.title}
          </h2>

          {/* 説明 */}
          <p className="text-gray-300 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-200">
            {step.description}
          </p>
        </div>

        {/* フッター */}
        <div className="relative p-6 flex items-center justify-between gap-4 border-t border-spiritual-lavender/30">
          {/* 戻るボタン */}
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-spiritual-lavender hover:text-white disabled:opacity-0 disabled:cursor-not-allowed transition-all"
          >
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              戻る
            </div>
          </button>

          {/* スキップボタン */}
          {!isLastStep && (
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-semibold text-spiritual-lavender hover:text-white transition-colors"
            >
              スキップ
            </button>
          )}

          {/* 次へ/完了ボタン */}
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <div className="flex items-center gap-2">
              {isLastStep ? '始める' : '次へ'}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
