'use client'

import { useState, useEffect } from 'react'
import { Calendar, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DailyFortune {
  id: string
  fortune_date: string
  overall: string
  focus_area: string
  advice: string
  lucky_color: string | null
  lucky_item: string | null
  lucky_action: string | null
  points_spent: number
  created_at: string
}

interface Props {
  userId: string
}

export default function DailyFortuneSection({ userId }: Props) {
  const router = useRouter()
  const [fortunes, setFortunes] = useState<DailyFortune[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<DailyFortune>>({})

  // 運勢データを取得
  useEffect(() => {
    fetchFortunes()
  }, [userId])

  const fetchFortunes = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}/daily-fortunes`)
      if (response.ok) {
        const data = await response.json()
        setFortunes(data)
      }
    } catch (error) {
      console.error('運勢データの取得エラー:', error)
    } finally {
      setLoading(false)
    }
  }

  // 編集モードを開始
  const startEditing = (fortune: DailyFortune) => {
    setEditingId(fortune.id)
    setEditFormData({
      overall: fortune.overall,
      focus_area: fortune.focus_area,
      advice: fortune.advice,
      lucky_color: fortune.lucky_color,
      lucky_item: fortune.lucky_item,
      lucky_action: fortune.lucky_action,
    })
  }

  // 編集をキャンセル
  const cancelEditing = () => {
    setEditingId(null)
    setEditFormData({})
  }

  // 更新を保存
  const saveUpdate = async (fortuneId: string) => {
    try {
      const response = await fetch(`/api/admin/daily-fortunes/${fortuneId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      if (response.ok) {
        await fetchFortunes()
        setEditingId(null)
        setEditFormData({})
      } else {
        alert('更新に失敗しました')
      }
    } catch (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
    }
  }

  // 削除
  const handleDelete = async (fortuneId: string) => {
    if (!confirm('この運勢データを削除しますか？')) {
      return
    }

    console.log('=== クライアント: 削除処理開始 ===')
    console.log('削除対象ID:', fortuneId)

    try {
      const url = `/api/admin/daily-fortunes/${fortuneId}`
      console.log('リクエストURL:', url)

      const response = await fetch(url, {
        method: 'DELETE',
      })

      console.log('レスポンスステータス:', response.status)
      const responseData = await response.json()
      console.log('レスポンスデータ:', responseData)

      if (response.ok) {
        console.log('削除成功、データ再取得中...')
        await fetchFortunes()
        console.log('データ再取得完了')
      } else {
        console.error('削除失敗:', responseData)
        alert(`削除に失敗しました: ${responseData.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-gray-500 dark:text-gray-400 mt-4">読み込み中...</p>
      </div>
    )
  }

  if (fortunes.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400">
          まだ今日の運勢データがありません
        </p>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-purple-600" />
        今日の運勢 ({fortunes.length}件)
      </h3>

      <div className="space-y-4">
        {fortunes.map((fortune) => (
          <div
            key={fortune.id}
            className="bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* ヘッダー */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(fortune.fortune_date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                    {fortune.points_spent} pt
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  作成日: {new Date(fortune.created_at).toLocaleString('ja-JP')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {editingId !== fortune.id && (
                  <>
                    <button
                      onClick={() => startEditing(fortune)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(fortune.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    setExpandedId(expandedId === fortune.id ? null : fortune.id)
                  }
                  className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  {expandedId === fortune.id ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* 展開コンテンツ */}
            {expandedId === fortune.id && (
              <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700">
                {editingId === fortune.id ? (
                  // 編集フォーム
                  <div className="pt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        総合運
                      </label>
                      <textarea
                        value={editFormData.overall || ''}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, overall: e.target.value })
                        }
                        rows={4}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        重点項目
                      </label>
                      <textarea
                        value={editFormData.focus_area || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            focus_area: e.target.value,
                          })
                        }
                        rows={5}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        アドバイス
                      </label>
                      <textarea
                        value={editFormData.advice || ''}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, advice: e.target.value })
                        }
                        rows={4}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ラッキーカラー
                        </label>
                        <input
                          type="text"
                          value={editFormData.lucky_color || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              lucky_color: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ラッキーアイテム
                        </label>
                        <input
                          type="text"
                          value={editFormData.lucky_item || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              lucky_item: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ラッキーアクション
                        </label>
                        <input
                          type="text"
                          value={editFormData.lucky_action || ''}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              lucky_action: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => saveUpdate(fortune.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        保存
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div className="pt-4 space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        総合運
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {fortune.overall}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        重点項目
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {fortune.focus_area}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        アドバイス
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                        {fortune.advice}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ラッキーカラー
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {fortune.lucky_color || '-'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ラッキーアイテム
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {fortune.lucky_item || '-'}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ラッキーアクション
                        </p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {fortune.lucky_action || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
