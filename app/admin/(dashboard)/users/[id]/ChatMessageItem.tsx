'use client'

import { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import EditMessageModal from './EditMessageModal'

interface ChatMessage {
  id: string
  content: string
  sender_type: 'user' | 'fortune_teller'
  created_at: string
  is_divination_request: boolean
  is_unlocked: boolean | null
  type: 'message' | 'divination'
}

interface Props {
  message: ChatMessage
  onUpdate: () => void
  isSelected?: boolean
  onToggleSelect?: (id: string, type: 'message' | 'divination') => void
}

/**
 * チャットメッセージアイテムコンポーネント（管理者用）
 *
 * 編集・削除ボタンを含むメッセージ表示
 */
export default function ChatMessageItem({
  message,
  onUpdate,
  isSelected = false,
  onToggleSelect
}: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * メッセージまたは鑑定結果の削除処理
   */
  const handleDelete = async () => {
    const itemType = message.type === 'divination' ? '鑑定結果' : 'メッセージ'
    if (!confirm(`この${itemType}を削除してもよろしいですか？`)) {
      return
    }

    setIsDeleting(true)
    try {
      // 鑑定結果とメッセージで異なるAPIエンドポイントを使用
      const endpoint =
        message.type === 'divination'
          ? `/api/admin/divination-results/${message.id}`
          : `/api/admin/chat-messages/${message.id}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || `${itemType}の削除に失敗しました`)
      }

      // 成功したら親コンポーネントに通知
      onUpdate()
    } catch (error) {
      console.error('削除エラー:', error)
      const itemType = message.type === 'divination' ? '鑑定結果' : 'メッセージ'
      alert(
        error instanceof Error ? error.message : `${itemType}の削除に失敗しました`
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div
        className={`flex group items-start gap-2 ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        {/* チェックボックス */}
        {onToggleSelect && (
          <div className="pt-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(message.id, message.type)}
              className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
            />
          </div>
        )}

        <div
          className={`max-w-[80%] rounded-lg p-3 relative ${
            message.sender_type === 'user'
              ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}
        >
          {/* 編集・削除ボタン */}
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* 鑑定結果は編集不可 */}
            {message.type !== 'divination' && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-1 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                title="編集"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 rounded bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50"
              title="削除"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold">
              {message.sender_type === 'user' ? 'ユーザー' : 'AI占い師'}
            </span>
            {message.type === 'divination' && (
              <>
                <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-indigo-200 dark:bg-indigo-800 text-indigo-800 dark:text-indigo-200">
                  鑑定結果
                </span>
                {message.is_unlocked !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                      message.is_unlocked
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                        : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200'
                    }`}
                  >
                    {message.is_unlocked ? '開封済み' : '未開封'}
                  </span>
                )}
              </>
            )}
            {message.is_divination_request && (
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200">
                鑑定リクエスト
              </span>
            )}
          </div>
          <p className="text-sm whitespace-pre-wrap break-words pr-16">
            {message.content}
          </p>
          <p className="text-xs opacity-70 mt-2">
            {new Date(message.created_at).toLocaleString('ja-JP')}
          </p>
        </div>
      </div>

      {/* 編集モーダル */}
      <EditMessageModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        message={message}
        onUpdate={onUpdate}
      />
    </>
  )
}
