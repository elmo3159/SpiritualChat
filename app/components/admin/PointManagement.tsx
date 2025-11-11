'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Minus, Loader2 } from 'lucide-react'

interface PointManagementProps {
  userId: string
  currentPoints: number
}

/**
 * ポイント管理コンポーネント
 *
 * 管理者がユーザーのポイントを追加・減算できる機能を提供
 */
export default function PointManagement({
  userId,
  currentPoints,
}: PointManagementProps) {
  const router = useRouter()
  const [amount, setAmount] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handlePointOperation = async (operation: 'add' | 'subtract') => {
    setError(null)
    setSuccess(null)

    const pointAmount = parseInt(amount)

    if (isNaN(pointAmount) || pointAmount <= 0) {
      setError('有効なポイント数を入力してください')
      return
    }

    if (operation === 'subtract' && pointAmount > currentPoints) {
      setError('残高を超えるポイントは減算できません')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount: operation === 'add' ? pointAmount : -pointAmount,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || 'ポイント更新に失敗しました')
        setIsLoading(false)
        return
      }

      setSuccess(
        `${pointAmount}ポイントを${operation === 'add' ? '追加' : '減算'}しました`
      )
      setAmount('')

      // ページをリフレッシュして最新のポイントを表示
      router.refresh()

      // 3秒後に成功メッセージを消す
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Point operation error:', err)
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent, operation: 'add' | 'subtract') => {
    e.preventDefault()
    handlePointOperation(operation)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        ポイント管理
      </h2>

      {/* メッセージ表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}

      {/* ポイント入力フォーム */}
      <form className="space-y-4">
        <div>
          <label
            htmlFor="pointAmount"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            ポイント数
          </label>
          <input
            type="number"
            id="pointAmount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="1"
            placeholder="1000"
            disabled={isLoading}
            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
        </div>

        {/* ボタン */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'add')}
            disabled={isLoading || !amount}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            <span>追加</span>
          </button>

          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'subtract')}
            disabled={isLoading || !amount}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Minus className="w-5 h-5" />
            )}
            <span>減算</span>
          </button>
        </div>
      </form>

      {/* クイックアクションボタン */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          クイック操作
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[1000, 5000, 10000].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setAmount(value.toString())}
              disabled={isLoading}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {(value / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
