'use client'

import PushNotificationForm from '@/app/components/admin/PushNotificationForm'
import PushNotificationHistory from '@/app/components/admin/PushNotificationHistory'
import { Bell } from 'lucide-react'

export default function PushNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              プッシュ通知管理
            </h1>
          </div>
          <p className="text-gray-600">
            登録ユーザーにプッシュ通知を送信できます
          </p>
        </div>

        {/* コンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 送信フォーム */}
          <div>
            <PushNotificationForm
              onSuccess={() => {
                // 履歴を再読み込みするためにページをリロード
                window.location.reload()
              }}
            />
          </div>

          {/* 送信履歴 */}
          <div>
            <PushNotificationHistory />
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ 注意事項</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>
              • プッシュ通知は、許可しているユーザーにのみ送信されます
            </li>
            <li>
              • 送信後の取り消しはできませんので、内容をよく確認してから送信してください
            </li>
            <li>
              • タイトルは50文字、本文は200文字まで入力可能です
            </li>
            <li>
              • 通知の送信には数秒〜数十秒かかる場合があります
            </li>
            <li>
              • 無効なサブスクリプション（アプリをアンインストールしたユーザーなど）は自動的に削除されます
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
