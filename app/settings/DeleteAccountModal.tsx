'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, AlertTriangle } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

/**
 * アカウント削除モーダル
 */
export default function DeleteAccountModal({ isOpen, onClose }: Props) {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (confirmText !== '退会する') {
      setError('「退会する」と入力してください')
      return
    }

    if (!confirm('本当にアカウントを削除してもよろしいですか？\n\nこの操作は取り消せません。\nすべてのデータが完全に削除されます。')) {
      return
    }

    setIsDeleting(true)
    setError('')

    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'アカウントの削除に失敗しました')
      }

      // 成功後、ログインページにリダイレクト
      alert('アカウントを削除しました。ご利用ありがとうございました。')
      router.push('/login')
    } catch (error) {
      console.error('アカウント削除エラー:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'アカウントの削除に失敗しました'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmText('')
      setError('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-spiritual-darker rounded-2xl border border-red-500/30 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-red-500/20">
          <h2 className="text-xl font-bold text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            アカウント削除
          </h2>
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="p-2 rounded-lg hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* 警告メッセージ */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-red-900/30 border border-red-500/30 rounded-lg space-y-2">
            <p className="text-sm text-red-300 font-semibold">
              ⚠️ この操作は取り消せません
            </p>
            <ul className="text-sm text-red-300 space-y-1 list-disc list-inside">
              <li>プロフィール情報がすべて削除されます</li>
              <li>チャット履歴がすべて削除されます</li>
              <li>鑑定結果がすべて削除されます</li>
              <li>所持ポイントは払い戻しできません</li>
              <li>同じメールアドレスでの再登録が必要になります</li>
            </ul>
          </div>

          {/* 確認入力 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              本当に削除する場合は「退会する」と入力してください
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
              className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/20 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors disabled:opacity-50"
              placeholder="退会する"
            />
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || confirmText !== '退会する'}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
            >
              {isDeleting ? '削除中...' : 'アカウントを削除'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
