'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DivinationResult from './DivinationResult'
import type { DivinationResultDisplay } from '@/lib/types/divination'
import { Filter, CheckCircle, Lock, CalendarDays } from 'lucide-react'

interface Props {
  /**
   * 鑑定結果のリスト
   */
  divinations: DivinationResultDisplay[]

  /**
   * 占い師ID
   */
  fortuneTellerId: string
}

type FilterType = 'all' | 'unlocked' | 'locked'

/**
 * 鑑定履歴リストコンポーネント
 *
 * 鑑定結果をフィルタリング可能な形で一覧表示します
 */
export default function DivinationHistoryList({
  divinations,
  fortuneTellerId,
}: Props) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localDivinations, setLocalDivinations] =
    useState<DivinationResultDisplay[]>(divinations)
  const router = useRouter()

  // フィルタリング
  const filteredDivinations = localDivinations.filter((div) => {
    if (filter === 'unlocked') return div.isUnlocked
    if (filter === 'locked') return !div.isUnlocked
    return true
  })

  // 統計
  const stats = {
    total: localDivinations.length,
    unlocked: localDivinations.filter((d) => d.isUnlocked).length,
    locked: localDivinations.filter((d) => !d.isUnlocked).length,
  }

  // 開封処理
  const handleUnlock = async (divinationId: string) => {
    setIsUnlocking(true)
    setError(null)

    try {
      const response = await fetch('/api/divination/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          divinationId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        // ポイント不足の場合、ポイント購入ページに遷移
        if (result.message === 'ポイントが不足しています') {
          router.push('/points/purchase')
          return
        }
        setError(result.message || '鑑定結果の開封に失敗しました')
        setIsUnlocking(false)
        return
      }

      if (result.data) {
        // 鑑定結果を更新（開封済みとして表示）
        setLocalDivinations((prev) =>
          prev.map((d) =>
            d.id === divinationId
              ? {
                  ...d,
                  isUnlocked: true,
                  resultFull: result.data.resultFull,
                  pointsConsumed: result.data.pointsConsumed,
                }
              : d
          )
        )
      }

      setIsUnlocking(false)
    } catch (error) {
      console.error('鑑定結果開封エラー:', error)
      setError('予期しないエラーが発生しました')
      setIsUnlocking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-5 h-5 text-purple-600" />
            <p className="text-xs text-gray-600">総数</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-xs text-gray-600">開封済み</p>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.unlocked}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-orange-600" />
            <p className="text-xs text-gray-600">未開封</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.locked}</p>
        </div>
      </div>

      {/* フィルタータブ */}
      <div className="bg-white rounded-xl p-1 shadow-sm border border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === 'all'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            全て ({stats.total})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === 'unlocked'
                ? 'bg-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            開封済み ({stats.unlocked})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              filter === 'locked'
                ? 'bg-orange-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            未開封 ({stats.locked})
          </button>
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* 鑑定結果リスト */}
      {filteredDivinations.length === 0 ? (
        <div className="text-center py-16">
          <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {filter === 'all'
              ? '鑑定履歴がまだありません'
              : filter === 'unlocked'
              ? '開封済みの鑑定結果がありません'
              : '未開封の鑑定結果がありません'}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredDivinations.map((divination, index) => (
            <div
              key={divination.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              {/* 日付ラベル */}
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">
                  {new Date(divination.createdAt).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* 鑑定結果 */}
              <DivinationResult
                divination={divination}
                onUnlock={handleUnlock}
                isUnlocking={isUnlocking}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
