'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  valid_from: string
  valid_until: string
  max_uses: number | null
  max_uses_per_user: number
  target_users: 'all' | 'specific'
  is_active: boolean
  created_at: string
}

interface Props {
  coupons: Coupon[]
}

export default function CouponList({ coupons }: Props) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`クーポン「${code}」を削除しますか？`)) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('削除に失敗しました')
      }

      router.refresh()
    } catch (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setTogglingId(id)
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('ステータス変更に失敗しました')
      }

      router.refresh()
    } catch (error) {
      console.error('ステータス変更エラー:', error)
      alert('ステータス変更に失敗しました')
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% OFF`
    } else {
      return `${coupon.discount_value}pt OFF`
    }
  }

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date()
  }

  if (coupons.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500">クーポンがありません</p>
        <Link
          href="/admin/coupons/new"
          className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-semibold"
        >
          最初のクーポンを作成
        </Link>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              コード
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              割引
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              有効期限
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              使用制限
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              対象
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
              ステータス
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
              操作
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {coupons.map((coupon) => {
            const expired = isExpired(coupon.valid_until)

            return (
              <tr key={coupon.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 bg-purple-50 text-purple-700 rounded font-mono text-sm font-bold">
                      {coupon.code}
                    </code>
                    {expired && (
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-semibold">
                        期限切れ
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-semibold text-sm">
                    {getDiscountDisplay(coupon)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  <div>
                    <div>{formatDate(coupon.valid_from)}</div>
                    <div className="text-gray-500">
                      ～ {formatDate(coupon.valid_until)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {coupon.max_uses ? (
                    <div>
                      <div>総数: {coupon.max_uses}回</div>
                      <div className="text-gray-500">
                        /人: {coupon.max_uses_per_user}回
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>無制限</div>
                      <div className="text-gray-500">
                        /人: {coupon.max_uses_per_user}回
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {coupon.target_users === 'all' ? '全ユーザー' : '特定ユーザー'}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      handleToggleActive(coupon.id, coupon.is_active)
                    }
                    disabled={togglingId === coupon.id}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      coupon.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } ${togglingId === coupon.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {togglingId === coupon.id
                      ? '処理中...'
                      : coupon.is_active
                        ? '有効'
                        : '無効'}
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/coupons/${coupon.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(coupon.id, coupon.code)}
                      disabled={deletingId === coupon.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
