'use client'

import { useState } from 'react'
import { X, Eye, EyeOff, Lock } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
}

/**
 * パスワード変更モーダル
 */
export default function ChangePasswordModal({ isOpen, onClose }: Props) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChanging, setIsChanging] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (newPassword.length < 6) {
      setError('新しいパスワードは6文字以上で入力してください')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません')
      return
    }

    setIsChanging(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'パスワードの変更に失敗しました')
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setSuccess(false)
      }, 2000)
    } catch (error) {
      console.error('パスワード変更エラー:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'パスワードの変更に失敗しました'
      )
    } finally {
      setIsChanging(false)
    }
  }

  const handleClose = () => {
    if (!isChanging) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-spiritual-darker rounded-2xl border border-spiritual-lavender/30 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-6 border-b border-spiritual-lavender/20">
          <h2 className="text-xl font-bold text-spiritual-gold flex items-center gap-2">
            <Lock className="w-5 h-5" />
            パスワード変更
          </h2>
          <button
            onClick={handleClose}
            disabled={isChanging}
            className="p-2 rounded-lg hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 現在のパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              現在のパスワード
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isChanging}
                className="w-full px-4 py-3 pr-12 bg-spiritual-dark/50 border border-spiritual-lavender/20 rounded-lg text-white focus:outline-none focus:border-spiritual-gold transition-colors disabled:opacity-50"
                placeholder="現在のパスワードを入力"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                disabled={isChanging}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 新しいパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isChanging}
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-spiritual-dark/50 border border-spiritual-lavender/20 rounded-lg text-white focus:outline-none focus:border-spiritual-gold transition-colors disabled:opacity-50"
                placeholder="新しいパスワード（6文字以上）"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                disabled={isChanging}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* 新しいパスワード（確認） */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              新しいパスワード（確認）
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isChanging}
                minLength={6}
                className="w-full px-4 py-3 pr-12 bg-spiritual-dark/50 border border-spiritual-lavender/20 rounded-lg text-white focus:outline-none focus:border-spiritual-gold transition-colors disabled:opacity-50"
                placeholder="新しいパスワードを再入力"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isChanging}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* 成功メッセージ */}
          {success && (
            <div className="p-3 bg-green-900/30 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-300">
                パスワードを変更しました
              </p>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isChanging}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isChanging}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold hover:from-spiritual-gold hover:to-spiritual-accent text-spiritual-dark rounded-lg font-bold transition-all duration-300 disabled:opacity-50"
            >
              {isChanging ? '変更中...' : '変更する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
