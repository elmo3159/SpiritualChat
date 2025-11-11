import { createClient } from '@/lib/supabase/server'
import {
  Users,
  Sparkles,
  DollarSign,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react'

/**
 * 管理者ダッシュボードトップページ
 *
 * 統計サマリーをレスポンシブグリッドで表示
 */

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 統計データを取得
  const [
    { count: totalUsers },
    { count: totalDivinations },
    { count: activeFortuneTellers },
    { data: recentUsers },
  ] = await Promise.all([
    // ユーザー総数
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    // 鑑定総数
    supabase.from('divination_results').select('*', { count: 'exact', head: true }),
    // アクティブな占い師数
    supabase
      .from('fortune_tellers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    // 最近登録されたユーザー（30日以内）
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ])

  // ポイント取引の統計
  const { data: pointsStats } = await supabase
    .from('points_transactions')
    .select('amount')
    .eq('transaction_type', 'purchase')

  const totalRevenue = pointsStats?.reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

  // 本日の統計
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [{ count: todayUsers }, { count: todayDivinations }] = await Promise.all([
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
    supabase
      .from('divination_results')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString()),
  ])

  const stats = [
    {
      title: 'ユーザー総数',
      value: totalUsers?.toString() || '0',
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      bgColor: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      change: recentUsers?.length
        ? `+${recentUsers.length} (30日)`
        : null,
    },
    {
      title: '鑑定総数',
      value: totalDivinations?.toString() || '0',
      icon: <Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />,
      bgColor: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      change: todayDivinations ? `+${todayDivinations} (本日)` : null,
    },
    {
      title: '総売上',
      value: `¥${totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-6 h-6 sm:w-8 sm:h-8" />,
      bgColor: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      change: null,
    },
    {
      title: 'アクティブ占い師',
      value: activeFortuneTellers?.toString() || '0',
      icon: <Activity className="w-6 h-6 sm:w-8 sm:h-8" />,
      bgColor: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      change: null,
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          ダッシュボード
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          スピチャ管理ダッシュボードへようこそ
        </p>
      </div>

      {/* 統計カードグリッド（レスポンシブ） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  {stat.title}
                </p>
                <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.change && (
                  <div className="mt-2 sm:mt-3 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-semibold text-green-600">
                      {stat.change}
                    </span>
                  </div>
                )}
              </div>
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.bgColor} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
              >
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 最近のアクティビティ（将来実装予定） */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            最近のアクティビティ
          </h2>
        </div>
        <div className="text-center py-8 sm:py-12">
          <Activity className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-gray-500">
            アクティビティログは今後実装予定です
          </p>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 text-white">
        <h2 className="text-lg sm:text-xl font-bold mb-2">
          クイックアクション
        </h2>
        <p className="text-purple-100 text-sm sm:text-base mb-4 sm:mb-6">
          よく使う機能に素早くアクセス
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <a
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors"
          >
            <Users className="w-5 h-5" />
            <span className="text-sm sm:text-base font-semibold">ユーザー管理</span>
          </a>
          <a
            href="/admin/fortune-tellers"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-sm sm:text-base font-semibold">占い師管理</span>
          </a>
          <a
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm transition-colors"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm sm:text-base font-semibold">売上分析</span>
          </a>
        </div>
      </div>
    </div>
  )
}
