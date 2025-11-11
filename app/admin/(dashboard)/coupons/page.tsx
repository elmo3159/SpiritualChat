import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Ticket, Calendar, Users, TrendingUp } from 'lucide-react'
import CouponList from './CouponList'

/**
 * クーポン管理ページ
 */
export default async function CouponsPage() {
  const supabase = createAdminClient()

  // クーポン一覧を取得
  const { data: coupons, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('クーポン取得エラー:', error)
  }

  // 統計情報を計算
  const activeCoupons = coupons?.filter((c) => c.is_active) || []
  const expiredCoupons =
    coupons?.filter((c) => new Date(c.valid_until) < new Date()) || []

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">クーポン管理</h1>
          <p className="text-sm text-gray-600 mt-1">
            割引クーポンの作成・編集・削除を行います
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>新規作成</span>
        </Link>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                総クーポン数
              </p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {coupons?.length || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Ticket className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">有効</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {activeCoupons.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">期限切れ</p>
              <p className="text-3xl font-bold text-gray-400 mt-1">
                {expiredCoupons.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* クーポン一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">クーポン一覧</h2>
        </div>
        <CouponList coupons={coupons || []} />
      </div>
    </div>
  )
}
