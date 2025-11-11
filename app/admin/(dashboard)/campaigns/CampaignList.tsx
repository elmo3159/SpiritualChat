'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit, Trash2, Power, PowerOff, Image as ImageIcon } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description: string
  start_date: string
  end_date: string
  bonus_percentage: number
  banner_image_url: string | null
  is_active: boolean
  created_at: string
}

interface Props {
  campaigns: Campaign[]
}

export default function CampaignList({ campaigns }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`キャンペーン「${name}」を削除しますか？`)) {
      return
    }

    setLoading(id)
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '削除に失敗しました')
      }

      alert('キャンペーンを削除しました')
      router.refresh()
    } catch (error: any) {
      console.error('削除エラー:', error)
      alert(error.message || '削除に失敗しました')
    } finally {
      setLoading(null)
    }
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setLoading(id)
    try {
      const response = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'ステータス更新に失敗しました')
      }

      router.refresh()
    } catch (error: any) {
      console.error('ステータス更新エラー:', error)
      alert(error.message || 'ステータス更新に失敗しました')
    } finally {
      setLoading(null)
    }
  }

  const getStatus = (campaign: Campaign) => {
    const now = new Date()
    const start = new Date(campaign.start_date)
    const end = new Date(campaign.end_date)

    if (!campaign.is_active) {
      return { label: '無効', color: 'bg-gray-100 text-gray-700' }
    }
    if (now < start) {
      return { label: '開催前', color: 'bg-blue-100 text-blue-700' }
    }
    if (now > end) {
      return { label: '終了', color: 'bg-gray-100 text-gray-700' }
    }
    return { label: '実施中', color: 'bg-green-100 text-green-700' }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">キャンペーンがありません</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              キャンペーン名
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              期間
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              ボーナス率
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              バナー
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              ステータス
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => {
            const status = getStatus(campaign)
            return (
              <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div>
                    <p className="font-medium text-gray-900">{campaign.name}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {campaign.description}
                    </p>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">開始: {formatDate(campaign.start_date)}</p>
                    <p className="text-xs text-gray-500">終了: {formatDate(campaign.end_date)}</p>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-100 text-purple-700 text-sm font-medium">
                    +{campaign.bonus_percentage}%
                  </span>
                </td>
                <td className="py-3 px-4">
                  {campaign.banner_image_url ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-xs">あり</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">なし</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleToggleActive(campaign.id, campaign.is_active)}
                      disabled={loading === campaign.id}
                      className={`p-2 rounded-lg transition-colors ${
                        campaign.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      } disabled:opacity-50`}
                      title={campaign.is_active ? '無効化' : '有効化'}
                    >
                      {campaign.is_active ? (
                        <Power className="w-4 h-4" />
                      ) : (
                        <PowerOff className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => router.push(`/admin/campaigns/${campaign.id}/edit`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="編集"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(campaign.id, campaign.name)}
                      disabled={loading === campaign.id}
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
