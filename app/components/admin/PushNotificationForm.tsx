'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface PushNotificationFormProps {
  onSuccess?: () => void
}

export default function PushNotificationForm({ onSuccess }: PushNotificationFormProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!title.trim() || !body.trim()) {
      setError('タイトルと本文は必須です')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/push/send-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification: {
            title: title.trim(),
            body: body.trim(),
            url: url.trim() || '/',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: 'admin-notification',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '送信に失敗しました')
      }

      setSuccess(
        `通知を送信しました（成功: ${data.sent}件、失敗: ${data.failed}件）`
      )

      // フォームをクリア
      setTitle('')
      setBody('')
      setUrl('')

      // コールバック実行
      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        プッシュ通知送信
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* タイトル */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="例: 新機能追加のお知らせ"
            maxLength={50}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {title.length}/50文字
          </p>
        </div>

        {/* 本文 */}
        <div>
          <label
            htmlFor="body"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            本文 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
            placeholder="例: スピチャに新しい占い師が追加されました！今すぐチェックしてください。"
            maxLength={200}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {body.length}/200文字
          </p>
        </div>

        {/* リンクURL */}
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            リンクURL（オプション）
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="例: /chat/1 or https://spiritualchat.pro"
          />
          <p className="mt-1 text-xs text-gray-500">
            通知をクリックした時に開くページ（空欄の場合はトップページ）
          </p>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 成功メッセージ */}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white
            transition-all duration-200 flex items-center justify-center gap-2
            ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>送信中...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>全ユーザーに送信</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          ⚠️ この通知は、プッシュ通知を許可しているすべてのユーザーに送信されます
        </p>
      </form>
    </div>
  )
}
