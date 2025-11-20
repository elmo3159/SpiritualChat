'use client'

import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, Loader2 } from 'lucide-react'

interface AppSetting {
  id: string
  key: string
  value: string
  description: string | null
  created_at: string
  updated_at: string
}

/**
 * 管理画面 - 設定ページ
 *
 * テストプランの表示/非表示などのアプリケーション設定を管理
 */
export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // 設定を取得
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('設定の取得に失敗しました')

      const data = await res.json()
      setSettings(data.settings || [])
    } catch (error: any) {
      console.error('設定取得エラー:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })

      if (!res.ok) throw new Error('設定の更新に失敗しました')

      const data = await res.json()

      // ローカル状態を更新
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value } : s))
      )

      setMessage({ type: 'success', text: '設定を更新しました' })

      // 3秒後にメッセージを消す
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      console.error('設定更新エラー:', error)
      setMessage({ type: 'error', text: error.message })
    } finally {
      setSaving(false)
    }
  }

  const toggleTestPlan = async () => {
    const setting = settings.find((s) => s.key === 'enable_test_plan')
    if (!setting) return

    const newValue = setting.value === 'true' ? 'false' : 'true'
    await updateSetting('enable_test_plan', newValue)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const testPlanSetting = settings.find((s) => s.key === 'enable_test_plan')
  const isTestPlanEnabled = testPlanSetting?.value === 'true'

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">設定</h1>
        <p className="mt-2 text-gray-600">
          アプリケーションの各種設定を管理します
        </p>
      </div>

      {/* メッセージ表示 */}
      {message && (
        <div
          className={`px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <p className="text-sm font-semibold">{message.text}</p>
        </div>
      )}

      {/* 設定カード */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-600">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">一般設定</h2>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* テストプラン表示設定 */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                🧪 100円テストプラン
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {testPlanSetting?.description ||
                  'ポイント購入画面にテストプランを表示します'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isTestPlanEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {isTestPlanEnabled ? '表示中' : '非表示'}
                </div>
              </div>
            </div>

            {/* トグルスイッチ */}
            <button
              onClick={toggleTestPlan}
              disabled={saving}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isTestPlanEnabled ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={isTestPlanEnabled}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  isTestPlanEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* 将来の設定項目用のプレースホルダー */}
          <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl text-center">
            <SettingsIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              今後、さらに設定項目を追加予定です
            </p>
          </div>
        </div>
      </div>

      {/* 設定詳細情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">i</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-blue-900 mb-1">
              テストプランについて
            </h3>
            <p className="text-sm text-blue-800">
              100円テストプランは、Stripe Webhookのテストやポイント購入フローの動作確認に使用します。
              本番環境では非表示にすることをお勧めします。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
