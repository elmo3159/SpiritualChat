'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { GenerateDivinationResponse } from '@/lib/types/divination'

interface Props {
  /**
   * 占い師ID
   */
  fortuneTellerId: string

  /**
   * ボタンを無効化するかどうか
   */
  disabled?: boolean

  /**
   * 鑑定生成成功時のコールバック
   */
  onDivinationGenerated?: (divinationId: string) => void

  /**
   * 鑑定生成状態変更時のコールバック
   */
  onGeneratingChange?: (isGenerating: boolean) => void

  /**
   * カスタムクラス名
   */
  className?: string
}

/**
 * 占ってもらうボタンコンポーネント
 *
 * クリックするとAI鑑定を生成し、データベースに保存します
 */
export default function DivinationButton({
  fortuneTellerId,
  disabled = false,
  onDivinationGenerated,
  onGeneratingChange,
  className = '',
}: Props) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDivinationRequest = async () => {
    setIsGenerating(true)
    onGeneratingChange?.(true)
    setError(null)

    try {
      const response = await fetch('/api/divination/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fortuneTellerId,
        }),
      })

      const result: GenerateDivinationResponse = await response.json()

      if (!result.success) {
        setError(result.message || '鑑定の生成に失敗しました')
        setIsGenerating(false)
        onGeneratingChange?.(false)
        return
      }

      // 成功時の処理
      // メッセージはRealtimeサブスクリプションで自動的に表示される
      if (result.data?.divination) {
        onDivinationGenerated?.(result.data.divination.id)
      }

      setIsGenerating(false)
      onGeneratingChange?.(false)
    } catch (error) {
      console.error('鑑定生成エラー:', error)
      setError('予期しないエラーが発生しました')
      setIsGenerating(false)
      onGeneratingChange?.(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleDivinationRequest}
        disabled={disabled || isGenerating}
        className="relative w-full px-6 py-2 bg-spiritual-gold text-white rounded-xl font-bold text-sm md:text-base shadow-lg shadow-spiritual-gold/30 hover:shadow-xl hover:shadow-spiritual-gold/50 hover:scale-[1.02] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 disabled:text-gray-400 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-spiritual-gold/40 overflow-hidden group"
      >
        {/* 輝きエフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

        <div className="relative z-10 flex items-center gap-2 md:gap-3">
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
              <span>鑑定中...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              <span>占ってもらう</span>
            </>
          )}
        </div>
      </button>

      {/* エラーメッセージ */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 border border-red-700/50 rounded-lg backdrop-blur-sm">
          <p className="text-sm text-red-300 text-center">{error}</p>
        </div>
      )}
    </div>
  )
}
