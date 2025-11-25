'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { GenerateDivinationResponse } from '@/lib/types/divination'

// ローカルストレージのキー
const GENERATING_STATE_KEY = 'divination_generating_state'

// タイムアウト時間（ミリ秒）- API側の待機時間(15秒) + 生成時間を考慮して90秒
const REQUEST_TIMEOUT_MS = 90000

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
 * 重複リクエスト防止とタイムアウト処理を実装
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
  const abortControllerRef = useRef<AbortController | null>(null)
  const isRequestInFlightRef = useRef(false)
  const router = useRouter()

  // 生成状態をクリア（useEffectより前に定義）
  const clearGeneratingState = useCallback(() => {
    setIsGenerating(false)
    onGeneratingChange?.(false)
    localStorage.removeItem(GENERATING_STATE_KEY)
    isRequestInFlightRef.current = false
  }, [onGeneratingChange])

  // コンポーネントマウント時に進行中の状態をチェック
  useEffect(() => {
    const savedState = localStorage.getItem(GENERATING_STATE_KEY)
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        // 保存から60秒以内で同じ占い師の場合は生成中として扱う
        const isRecent = Date.now() - state.timestamp < 60000
        if (isRecent && state.fortuneTellerId === fortuneTellerId) {
          setIsGenerating(true)
          onGeneratingChange?.(true)
          // 60秒後に自動的にリセット
          const timeRemaining = 60000 - (Date.now() - state.timestamp)
          setTimeout(() => {
            clearGeneratingState()
          }, timeRemaining)
        } else {
          // 古い状態はクリア
          localStorage.removeItem(GENERATING_STATE_KEY)
        }
      } catch {
        localStorage.removeItem(GENERATING_STATE_KEY)
      }
    }

    // クリーンアップ
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fortuneTellerId, onGeneratingChange, clearGeneratingState])

  // 生成状態を保存
  const saveGeneratingState = () => {
    const state = {
      fortuneTellerId,
      timestamp: Date.now(),
    }
    localStorage.setItem(GENERATING_STATE_KEY, JSON.stringify(state))
  }

  const handleDivinationRequest = async () => {
    // 既にリクエスト中の場合は無視
    if (isRequestInFlightRef.current || isGenerating) {
      console.log('鑑定リクエストは既に進行中です')
      return
    }

    isRequestInFlightRef.current = true
    setIsGenerating(true)
    onGeneratingChange?.(true)
    saveGeneratingState()
    setError(null)

    // AbortControllerを作成
    abortControllerRef.current = new AbortController()
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }, REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch('/api/divination/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fortuneTellerId,
          requestId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }),
        signal: abortControllerRef.current.signal,
      })

      clearTimeout(timeoutId)

      const result: GenerateDivinationResponse = await response.json()

      if (!result.success) {
        setError(result.message || '鑑定の生成に失敗しました')
        clearGeneratingState()
        return
      }

      // 成功時の処理
      // isDuplicateがtrueの場合も成功として扱う（既存の鑑定が使われる）
      if (result.data?.divination) {
        onDivinationGenerated?.(result.data.divination.id)
      }

      clearGeneratingState()
    } catch (error: any) {
      clearTimeout(timeoutId)

      if (error.name === 'AbortError') {
        console.log('鑑定リクエストがタイムアウトしました')
        // タイムアウトの場合はエラーを表示せず、バックグラウンドで処理が続いている可能性を考慮
        // ユーザーにはページをリロードするよう促す
        setError('鑑定に時間がかかっています。しばらくお待ちいただくか、ページを更新してください。')
      } else {
        console.error('鑑定生成エラー:', error)
        setError('予期しないエラーが発生しました')
      }
      clearGeneratingState()
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        onClick={handleDivinationRequest}
        disabled={disabled || isGenerating}
        className="relative w-full px-6 py-2 bg-spiritual-gold text-gray-900 rounded-xl font-bold text-sm md:text-base shadow-lg shadow-spiritual-gold/30 hover:shadow-xl hover:shadow-spiritual-gold/50 hover:scale-[1.02] disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 disabled:text-gray-400 transition-all duration-300 flex items-center justify-center gap-2 border-2 border-spiritual-gold/40 overflow-hidden group"
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
