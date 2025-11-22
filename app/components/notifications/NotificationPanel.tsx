'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Check, Sparkles, Coins, MessageCircle, Info, TrendingUp, Award, Gift, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  type: 'new_message' | 'divination_ready' | 'points_low' | 'system' | 'level_up' | 'badge_earned' | 'points_awarded' | 'exp_awarded'
  title: string
  message: string
  is_read: boolean
  reference_type?: string
  reference_id?: string
  created_at: string
}

/**
 * 通知パネルコンポーネント
 *
 * 通知の一覧を表示し、既読管理を行います。
 * Supabase Realtimeでリアルタイムに通知を受け取ります。
 */
export default function NotificationPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 通知アイコン取得
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle className="w-5 h-5 text-spiritual-gold" />
      case 'divination_ready':
        return <Sparkles className="w-5 h-5 text-spiritual-accent" />
      case 'points_low':
        return <Coins className="w-5 h-5 text-yellow-500" />
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-spiritual-accent" />
      case 'badge_earned':
        return <Award className="w-5 h-5 text-spiritual-gold" />
      case 'points_awarded':
        return <Gift className="w-5 h-5 text-green-500" />
      case 'exp_awarded':
        return <Zap className="w-5 h-5 text-blue-500" />
      case 'system':
        return <Info className="w-5 h-5 text-spiritual-lavender" />
    }
  }

  // 通知一覧取得
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(
          data.notifications.filter((n: Notification) => !n.is_read).length
        )
      }
    } catch (error) {
      console.error('通知取得エラー:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 初回読み込み
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Realtime購読
  useEffect(() => {
    const supabase = createClient()

    // 通知のリアルタイム購読
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification
          setNotifications((prev) => [newNotification, ...prev])
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const updatedNotification = payload.new as Notification
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          )
          // 未読数を再計算
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // パネルを開いたときに自動的にすべて既読にする
  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      markAllAsRead()
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // すべて既読にする
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id)

    if (unreadIds.length === 0) return

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('既読処理エラー:', error)
    }
  }

  // 個別既読
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      })

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('既読処理エラー:', error)
    }
  }

  // 相対時間表示
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return date.toLocaleDateString('ja-JP')
  }

  return (
    <div className="relative">
      {/* ベルアイコン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-spiritual-light/20 transition-colors"
        aria-label="通知"
      >
        <Bell className="w-6 h-6 text-spiritual-gold hover:text-spiritual-accent transition-colors" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </div>
        )}
      </button>

      {/* 通知パネル */}
      {isOpen && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* パネル */}
          <div className="fixed md:absolute left-4 right-4 md:left-auto md:right-0 top-16 md:top-12 w-auto md:w-96 max-h-[500px] bg-spiritual-dark border-2 border-spiritual-lavender/30 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* ヘッダー */}
            <div className="bg-gradient-to-r from-spiritual-purple to-spiritual-light px-4 py-3 flex items-center justify-between border-b border-spiritual-lavender/30">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                通知
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-spiritual-gold hover:text-spiritual-accent transition-colors flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    すべて既読
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 通知リスト */}
            <div className="overflow-y-auto max-h-[420px] divide-y divide-spiritual-lavender/20">
              {isLoading ? (
                <div className="p-8 text-center text-spiritual-lavender">
                  読み込み中...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-spiritual-lavender/50 mx-auto mb-3" />
                  <p className="text-spiritual-lavender">
                    通知はありません
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-spiritual-light/20 transition-colors cursor-pointer ${
                      !notification.is_read ? 'bg-spiritual-purple/20' : ''
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id)
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-white">
                            {notification.title}
                          </h4>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-spiritual-accent rounded-full flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-spiritual-lavender/70 mt-1">
                          {getRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
