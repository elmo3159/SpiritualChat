'use client'

import { useState, useCallback } from 'react'
import { RefreshCw, AlertCircle } from 'lucide-react'

interface MessageLimit {
  fortuneTellerId: string
  fortuneTellerName: string
  currentCount: number
  remainingCount: number
}

interface MessageLimitResetProps {
  userId: string
  messageLimits: MessageLimit[]
  onReset: () => void
}

/**
 * メッセージ制限リセットコンポーネント
 *
 * 管理者がユーザーの3回までのチャット送信制限をリセットできる機能を提供
 */
export default function MessageLimitReset({
  userId,
  messageLimits,
  onReset,
}: MessageLimitResetProps) {
  const [resetting, setResetting] = useState<string | null>(null)

  const handleReset = useCallback(
    async (fortuneTellerId?: string) => {
      const targetName = fortuneTellerId
        ? messageLimits.find((ml) => ml.fortuneTellerId === fortuneTellerId)
            ?.fortuneTellerName
        : '全占い師'

      if (
        !confirm(
          `${targetName}とのメッセージ制限をリセットしてもよろしいですか？`
        )
      ) {
        return
      }

      setResetting(fortuneTellerId || 'all')

      try {
        const response = await fetch(
          `/api/admin/users/${userId}/reset-message-limits`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fortuneTellerId }),
          }
        )

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'リセットに失敗しました')
        }

        alert(result.message)
        onReset()
      } catch (error) {
        console.error('メッセージ制限リセットエラー:', error)
        alert(
          error instanceof Error ? error.message : 'リセットに失敗しました'
        )
      } finally {
        setResetting(null)
      }
    },
    [userId, messageLimits, onReset]
  )

  const hasAnyLimits = messageLimits.some((ml) => ml.currentCount > 0)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-purple-600" />
          メッセージ制限管理
        </h2>
      </div>

      {messageLimits.length === 0 ? (
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            まだメッセージのやり取りがありません
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 占い師別のメッセージ制限表示 */}
          {messageLimits.map((limit) => (
            <div
              key={limit.fortuneTellerId}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {limit.fortuneTellerName}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      今日の送信回数:{' '}
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {limit.currentCount} / 3
                      </span>
                    </p>
                    <p>
                      残り:{' '}
                      <span
                        className={`font-semibold ${
                          limit.remainingCount === 0
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {limit.remainingCount}回
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleReset(limit.fortuneTellerId)}
                disabled={resetting === limit.fortuneTellerId}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetting === limit.fortuneTellerId ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    リセット中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    この占い師との制限をリセット
                  </>
                )}
              </button>
            </div>
          ))}

          {/* 全体リセットボタン */}
          {hasAnyLimits && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleReset()}
                disabled={resetting === 'all'}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {resetting === 'all' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    リセット中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    全占い師との制限をリセット
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
