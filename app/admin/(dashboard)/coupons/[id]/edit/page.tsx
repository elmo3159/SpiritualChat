import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CouponForm from '../../CouponForm'

interface Props {
  params: {
    id: string
  }
}

/**
 * クーポン編集ページ
 */
export default async function EditCouponPage({ params }: Props) {
  const supabase = createAdminClient()

  // クーポンデータを取得
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !coupon) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/coupons"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">クーポン編集</h1>
          <p className="text-sm text-gray-600 mt-1">
            クーポン「{coupon.code}」を編集します
          </p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <CouponForm coupon={coupon} />
      </div>
    </div>
  )
}
