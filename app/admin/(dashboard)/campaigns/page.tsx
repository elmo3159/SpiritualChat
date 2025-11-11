import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Calendar, Percent, Activity } from 'lucide-react'
import CampaignList from './CampaignList'

/**
 * キャンペーン管理ページ
 */
export default async function CampaignsPage() {
  const supabase = createAdminClient()

  // キャンペーン一覧を取得
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('キャンペーン取得エラー:', error)
  }

  // 統計データ
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns =
    campaigns?.filter(
      (c) =>
        c.is_active &&
        new Date(c.start_date) <= new Date() &&
        new Date(c.end_date) >= new Date()
    ) || []
  const upcomingCampaigns =
    campaigns?.filter(
      (c) => c.is_active && new Date(c.start_date) > new Date()
    ) || []

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            キャンペーン管理
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            ポイント購入時のボーナスキャンペーンを管理します
          </p>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>新規作成</span>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">総キャンペーン数</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCampaigns}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">実施中</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeCampaigns.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">開催予定</p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingCampaigns.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* キャンペーン一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          キャンペーン一覧
        </h2>
        <CampaignList campaigns={campaigns || []} />
      </div>
    </div>
  )
}
