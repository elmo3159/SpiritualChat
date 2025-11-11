'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'

interface CouponData {
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  valid_from: string
  valid_until: string
  max_uses: number | null
  max_uses_per_user: number
  target_users: 'all' | 'specific'
  specific_user_ids: string[]
  is_active: boolean
}

interface Props {
  coupon?: CouponData & { id: string }
}

export default function CouponForm({ coupon }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CouponData>({
    code: coupon?.code || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value || 10,
    valid_from: coupon?.valid_from?.slice(0, 16) || '',
    valid_until: coupon?.valid_until?.slice(0, 16) || '',
    max_uses: coupon?.max_uses || null,
    max_uses_per_user: coupon?.max_uses_per_user || 1,
    target_users: coupon?.target_users || 'all',
    specific_user_ids: coupon?.specific_user_ids || [],
    is_active: coupon?.is_active ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.code.trim()) {
      alert('クーポンコードを入力してください')
      return
    }

    if (formData.discount_value <= 0) {
      alert('割引額は1以上の数値を入力してください')
      return
    }

    if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
      alert('割引率は100%以下で入力してください')
      return
    }

    if (!formData.valid_from || !formData.valid_until) {
      alert('有効期限を入力してください')
      return
    }

    if (new Date(formData.valid_from) >= new Date(formData.valid_until)) {
      alert('終了日は開始日より後の日付を指定してください')
      return
    }

    setLoading(true)

    try {
      const url = coupon
        ? `/api/admin/coupons/${coupon.id}`
        : '/api/admin/coupons'

      const method = coupon ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '保存に失敗しました')
      }

      alert(coupon ? 'クーポンを更新しました' : 'クーポンを作成しました')
      router.push('/admin/coupons')
      router.refresh()
    } catch (error: any) {
      console.error('保存エラー:', error)
      alert(error.message || '保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* クーポンコード */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          クーポンコード <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-gray-900"
          placeholder="例: SUMMER2024"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          英数字で入力してください（自動的に大文字に変換されます）
        </p>
      </div>

      {/* 割引タイプと値 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            割引タイプ <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.discount_type}
            onChange={(e) =>
              setFormData({
                ...formData,
                discount_type: e.target.value as 'percentage' | 'fixed_amount',
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
          >
            <option value="percentage">パーセント割引（%）</option>
            <option value="fixed_amount">固定額割引（pt）</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            割引値 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.discount_value}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_value: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              min="1"
              max={formData.discount_type === 'percentage' ? '100' : undefined}
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {formData.discount_type === 'percentage' ? '%' : 'pt'}
            </span>
          </div>
        </div>
      </div>

      {/* 有効期限 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            開始日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.valid_from}
            onChange={(e) =>
              setFormData({ ...formData, valid_from: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            終了日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) =>
              setFormData({ ...formData, valid_until: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            required
          />
        </div>
      </div>

      {/* 使用制限 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            総使用回数制限
          </label>
          <input
            type="number"
            value={formData.max_uses || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_uses: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="無制限"
            min="1"
          />
          <p className="text-xs text-gray-500 mt-1">
            空欄の場合は無制限
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            1ユーザーあたりの使用回数 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.max_uses_per_user}
            onChange={(e) =>
              setFormData({
                ...formData,
                max_uses_per_user: parseInt(e.target.value) || 1,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            min="1"
            required
          />
        </div>
      </div>

      {/* 対象ユーザー */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          対象ユーザー <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="target_users"
              value="all"
              checked={formData.target_users === 'all'}
              onChange={(e) =>
                setFormData({ ...formData, target_users: 'all' })
              }
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-700">全ユーザー</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="target_users"
              value="specific"
              checked={formData.target_users === 'specific'}
              onChange={(e) =>
                setFormData({ ...formData, target_users: 'specific' })
              }
              className="w-4 h-4 text-purple-600"
            />
            <span className="text-sm text-gray-700">特定ユーザー</span>
          </label>
        </div>
      </div>

      {/* ステータス */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData({ ...formData, is_active: e.target.checked })
            }
            className="w-4 h-4 text-purple-600 rounded"
          />
          <span className="text-sm font-semibold text-gray-700">有効化</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">
          チェックを外すと、クーポンを無効化できます
        </p>
      </div>

      {/* 送信ボタン */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{coupon ? '更新' : '作成'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
