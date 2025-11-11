'use client'

import { useState, useCallback } from 'react'
import { MessageSquare, Sparkles, Trash2, CheckSquare, Square } from 'lucide-react'
import ChatMessageItem from './ChatMessageItem'

interface ChatMessage {
  id: string
  content: string
  sender_type: 'user' | 'fortune_teller'
  created_at: string
  is_divination_request: boolean
  is_unlocked: boolean | null
  type: 'message' | 'divination'
}

interface ChatHistoryItem {
  fortuneTellerId: string
  fortuneTellerName: string
  messages: ChatMessage[]
}

interface Props {
  initialChatHistory: ChatHistoryItem[]
  userId: string
}

/**
 * チャット履歴表示セクション（管理者用）
 *
 * メッセージの編集・削除機能を含む
 */
export default function ChatHistorySection({ initialChatHistory, userId }: Props) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(initialChatHistory)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [selectedDivinations, setSelectedDivinations] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  /**
   * チャット履歴を再取得
   */
  const refreshChatHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      // ページ全体をリロード（サーバーコンポーネントのデータを再取得）
      window.location.reload()
    } catch (error) {
      console.error('チャット履歴の更新に失敗:', error)
      alert('チャット履歴の更新に失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * メッセージの選択状態をトグル
   */
  const handleToggleSelect = useCallback((id: string, type: 'message' | 'divination') => {
    if (type === 'divination') {
      setSelectedDivinations((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    } else {
      setSelectedMessages((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    }
  }, [])

  /**
   * 全選択
   */
  const handleSelectAll = useCallback(() => {
    const allMessages = new Set<string>()
    const allDivinations = new Set<string>()

    chatHistory.forEach((chat) => {
      chat.messages.forEach((message) => {
        if (message.type === 'divination') {
          allDivinations.add(message.id)
        } else {
          allMessages.add(message.id)
        }
      })
    })

    setSelectedMessages(allMessages)
    setSelectedDivinations(allDivinations)
  }, [chatHistory])

  /**
   * 全解除
   */
  const handleDeselectAll = useCallback(() => {
    setSelectedMessages(new Set())
    setSelectedDivinations(new Set())
  }, [])

  /**
   * 一括削除
   */
  const handleBulkDelete = useCallback(async () => {
    const totalSelected = selectedMessages.size + selectedDivinations.size

    if (totalSelected === 0) {
      alert('削除するアイテムを選択してください')
      return
    }

    if (!confirm(`選択された${totalSelected}件のアイテムを削除してもよろしいですか？`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch('/api/admin/chat-messages/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageIds: Array.from(selectedMessages),
          divinationIds: Array.from(selectedDivinations),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || '一括削除に失敗しました')
      }

      // 選択をクリア
      setSelectedMessages(new Set())
      setSelectedDivinations(new Set())

      // 成功したら画面を更新
      refreshChatHistory()
    } catch (error) {
      console.error('一括削除エラー:', error)
      alert(error instanceof Error ? error.message : '一括削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }, [selectedMessages, selectedDivinations, refreshChatHistory])

  // 全選択されているかチェック
  const isAllSelected = useCallback(() => {
    let totalMessages = 0
    chatHistory.forEach((chat) => {
      totalMessages += chat.messages.length
    })
    return totalMessages > 0 && selectedMessages.size + selectedDivinations.size === totalMessages
  }, [chatHistory, selectedMessages, selectedDivinations])

  if (chatHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          チャット履歴
        </h2>
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            まだチャット履歴がありません
          </p>
        </div>
      </div>
    )
  }

  const totalSelected = selectedMessages.size + selectedDivinations.size

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            チャット履歴
            {isLoading && (
              <span className="text-xs text-gray-500">読み込み中...</span>
            )}
          </h2>

          {/* 操作ボタン */}
          <div className="flex items-center gap-2">
            {/* 全選択/全解除ボタン */}
            <button
              onClick={isAllSelected() ? handleDeselectAll : handleSelectAll}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              {isAllSelected() ? (
                <>
                  <Square className="w-4 h-4" />
                  全解除
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  全選択
                </>
              )}
            </button>

            {/* 一括削除ボタン */}
            <button
              onClick={handleBulkDelete}
              disabled={totalSelected === 0 || isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting
                ? '削除中...'
                : totalSelected > 0
                ? `選択中 (${totalSelected}件) を削除`
                : '一括削除'}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {chatHistory.map((chat) => (
          <div
            key={chat.fortuneTellerId}
            className="border-b border-gray-200 dark:border-gray-700 last:border-0 pb-6 last:pb-0"
          >
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              {chat.fortuneTellerName}
              <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                ({chat.messages.length}件)
              </span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {chat.messages.map((message) => (
                <ChatMessageItem
                  key={message.id}
                  message={message}
                  onUpdate={refreshChatHistory}
                  isSelected={
                    message.type === 'divination'
                      ? selectedDivinations.has(message.id)
                      : selectedMessages.has(message.id)
                  }
                  onToggleSelect={handleToggleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
