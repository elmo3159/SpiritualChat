import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CampaignForm from '../../CampaignForm'

interface Props {
  params: {
    id: string
  }
}

/**
 * キャンペーン編集ページ
 */
export default async function EditCampaignPage({ params }: Props) {
  const supabase = createAdminClient()

  // キャンペーンデータを取得
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !campaign) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/campaigns"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">キャンペーン編集</h1>
          <p className="text-sm text-gray-600 mt-1">
            キャンペーン「{campaign.name}」を編集します
          </p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <CampaignForm campaign={campaign} />
      </div>
    </div>
  )
}
