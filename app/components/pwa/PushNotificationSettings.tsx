'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import {
  getNotificationPermission,
  enablePushNotifications,
  disablePushNotifications,
} from '@/lib/pwa/push-notifications'

/**
 * プッシュ通知設定コンポーネント
 *
 * プッシュ通知のON/OFF切り替え
 */
export default function PushNotificationSettings() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // ブラウザがプッシュ通知をサポートしているかチェック
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setIsSupported(false)
      return
    }

    // 現在の許可状態を確認
    const permission = getNotificationPermission()
    setIsEnabled(permission === 'granted')
  }, [])

  const handleToggle = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isEnabled) {
        // 無効化
        const result = await disablePushNotifications()
        if (result.success) {
          setIsEnabled(false)
        } else {
          setError(result.error || '無効化に失敗しました')
        }
      } else {
        // 有効化
        const result = await enablePushNotifications()
        if (result.success) {
          setIsEnabled(true)
        } else {
          setError(result.error || '有効化に失敗しました')
        }
      }
    } catch (err: any) {
      setError(err.message || '予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return (
      <div className="bg-spiritual-purple/20 backdrop-blur-sm rounded-xl p-4 border border-spiritual-lavender/20">
        <p className="text-sm text-gray-400">
          お使いのブラウザはプッシュ通知をサポートしていません
        </p>
      </div>
    )
  }

  return (
    <div className="bg-spiritual-purple/20 backdrop-blur-sm rounded-xl p-4 border border-spiritual-lavender/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {isEnabled ? (
            <Bell className="w-5 h-5 text-spiritual-gold" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="text-white font-medium text-sm">プッシュ通知</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              鑑定結果や新着情報をお知らせ
            </p>
          </div>
        </div>

        {/* トグルスイッチ */}
        <button
          onClick={handleToggle}
          disabled={isLoading}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${isEnabled ? 'bg-spiritual-gold' : 'bg-gray-600'}
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          role="switch"
          aria-checked={isEnabled}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-700/30 rounded-lg">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* 説明 */}
      {isEnabled && (
        <div className="mt-3 space-y-1.5">
          <div className="flex items-start gap-2 text-xs text-spiritual-lavender">
            <span className="text-spiritual-gold">✓</span>
            <span>鑑定結果が出たら即座にお知らせ</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-spiritual-lavender">
            <span className="text-spiritual-gold">✓</span>
            <span>新しい占い師追加のお知らせ</span>
          </div>
          <div className="flex items-start gap-2 text-xs text-spiritual-lavender">
            <span className="text-spiritual-gold">✓</span>
            <span>ポイントキャンペーン情報</span>
          </div>
        </div>
      )}
    </div>
  )
}
