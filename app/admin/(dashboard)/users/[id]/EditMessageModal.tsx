'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface ChatMessage {
  id: string
  content: string
  sender_type: 'user' | 'fortune_teller'
  created_at: string
  is_divination_request: boolean
  is_unlocked: boolean | null
}

interface Props {
  isOpen: boolean
  onClose: () => void
  message: ChatMessage
  onUpdate: () => void
}

/**
 * メッセージ編集モーダルコンポーネント（管理者用）
 */
export default function EditMessageModal({ isOpen, onClose, message, onUpdate }: Props) {
  const [content, setContent] = useState(message.content)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // モーダルが開かれたら内容をリセット
  useEffect(() => {
    if (isOpen) {
      setContent(message.content)
      setError(null)
    }
  }, [isOpen, message.content])

  /**
   * メッセージ更新処理
   */
  const handleSave = async () => {
    if (!content.trim()) {
      setError('メッセージ内容を入力してください')
      return
    }

    if (content.length > 1000) {
      setError('メッセージは1000文字以内で入力してください')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/chat-messages/${message.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'メッセージの更新に失敗しました')
      }

      // 成功したら親コンポーネントに通知してモーダルを閉じる
      onUpdate()
      onClose()
    } catch (error) {
      console.error('更新エラー:', error)
      setError(error instanceof Error ? error.message : 'メッセージの更新に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            メッセージを編集
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            disabled={isSaving}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              送信者
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {message.sender_type === 'user' ? 'ユーザー' : 'AI占い師'}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              送信日時
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(message.created_at).toLocaleString('ja-JP')}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              メッセージ内容
              <span className="ml-2 text-xs text-gray-500">
                ({content.length}/1000文字)
              </span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              rows={10}
              maxLength={1000}
              disabled={isSaving}
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            disabled={isSaving}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}
