'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface CampaignData {
  name: string
  description: string
  start_date: string
  end_date: string
  bonus_percentage: number
  banner_image_url: string | null
  is_active: boolean
}

interface Props {
  campaign?: CampaignData & { id: string }
}

export default function CampaignForm({ campaign }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(
    campaign?.banner_image_url || null
  )
  const [formData, setFormData] = useState<CampaignData>({
    name: campaign?.name || '',
    description: campaign?.description || '',
    start_date: campaign?.start_date?.slice(0, 16) || '',
    end_date: campaign?.end_date?.slice(0, 16) || '',
    bonus_percentage: campaign?.bonus_percentage || 10,
    banner_image_url: campaign?.banner_image_url || null,
    is_active: campaign?.is_active ?? true,
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    // ファイル形式チェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `campaign-banners/${fileName}`

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      // 公開URLを取得
      const {
        data: { publicUrl },
      } = supabase.storage.from('public').getPublicUrl(filePath)

      setFormData({ ...formData, banner_image_url: publicUrl })
      setImagePreview(publicUrl)
    } catch (error: any) {
      console.error('画像アップロードエラー:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, banner_image_url: null })
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!formData.name.trim()) {
      alert('キャンペーン名を入力してください')
      return
    }

    if (!formData.description.trim()) {
      alert('説明を入力してください')
      return
    }

    if (formData.bonus_percentage <= 0 || formData.bonus_percentage > 100) {
      alert('ボーナス率は1〜100%の範囲で入力してください')
      return
    }

    if (!formData.start_date || !formData.end_date) {
      alert('開催期間を入力してください')
      return
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      alert('終了日は開始日より後の日付を指定してください')
      return
    }

    setLoading(true)

    try {
      const url = campaign
        ? `/api/admin/campaigns/${campaign.id}`
        : '/api/admin/campaigns'

      const method = campaign ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '保存に失敗しました')
      }

      alert(campaign ? 'キャンペーンを更新しました' : 'キャンペーンを作成しました')
      router.push('/admin/campaigns')
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
      {/* キャンペーン名 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          キャンペーン名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="例: 新春特別キャンペーン"
          required
        />
      </div>

      {/* 説明 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          説明 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="キャンペーンの詳細を入力してください"
          rows={4}
          required
        />
      </div>

      {/* 開催期間 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            開始日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.start_date}
            onChange={(e) =>
              setFormData({ ...formData, start_date: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            終了日時 <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) =>
              setFormData({ ...formData, end_date: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* ボーナス率 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          ボーナスポイント率 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.bonus_percentage}
            onChange={(e) =>
              setFormData({
                ...formData,
                bonus_percentage: parseInt(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            min="1"
            max="100"
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            %
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          ポイント購入時に追加されるボーナスポイントの割合（1〜100%）
        </p>
      </div>

      {/* バナー画像 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          バナー画像
        </label>

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="バナープレビュー"
              className="w-full max-w-2xl h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              画像をアップロードしてください
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG, GIF（最大5MB）
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'アップロード中...' : 'ファイルを選択'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}
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
          チェックを外すと、キャンペーンを無効化できます
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
          disabled={loading || uploading}
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
              <span>{campaign ? '更新' : '作成'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
