'use client'

import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Users, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface NotificationHistoryItem {
  id: string
  title: string
  body: string
  url: string | null
  target_type: 'all' | 'single'
  sent_count: number
  failed_count: number
  created_at: string
}

export default function PushNotificationHistory() {
  const [history, setHistory] = useState<NotificationHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchHistory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/push/history?limit=20')
      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '履歴の取得に失敗しました')
      }

      setHistory(data.data || [])
      setTotal(data.total || 0)
    } catch (err: any) {
      setError(err.message || '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          <span className="ml-3 text-gray-600">読み込み中...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
        <button
          onClick={fetchHistory}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          再読み込み
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">送信履歴</h2>
        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">更新</span>
        </button>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">まだ送信履歴がありません</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-4">
            全{total}件の送信履歴（最新20件を表示）
          </p>

          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gray-900">{item.title}</h3>
                  <span
                    className={`
                      px-2 py-1 text-xs rounded-full
                      ${
                        item.target_type === 'all'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    `}
                  >
                    {item.target_type === 'all' ? '全ユーザー' : '個別'}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3">{item.body}</p>

                {item.url && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">リンク: </span>
                    <span className="text-xs text-purple-600">{item.url}</span>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {format(new Date(item.created_at), 'yyyy/MM/dd HH:mm', {
                        locale: ja,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>
                      成功: {item.sent_count}件 / 失敗: {item.failed_count}件
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
