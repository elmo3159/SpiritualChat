import { createClient } from '@/lib/supabase/server'
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react'

// キャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * 売上分析ページ
 *
 * 日別・月別の売上グラフ、占い師別売上ランキングを表示
 */
export default async function AnalyticsPage() {
  const supabase = await createClient()

  // 全期間の売上データ取得
  const { data: allTransactions } = await supabase
    .from('points_transactions')
    .select('amount, created_at, description')
    .eq('transaction_type', 'purchase')
    .order('created_at', { ascending: false })

  // 日別集計
  const dailyStats: Record<string, number> = {}
  allTransactions?.forEach((tx) => {
    const date = new Date(tx.created_at).toLocaleDateString('ja-JP')
    dailyStats[date] = (dailyStats[date] || 0) + tx.amount
  })

  const dailyData = Object.entries(dailyStats)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 30) // 最新30日

  // 月別集計
  const monthlyStats: Record<string, number> = {}
  allTransactions?.forEach((tx) => {
    const month = new Date(tx.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
    monthlyStats[month] = (monthlyStats[month] || 0) + tx.amount
  })

  const monthlyData = Object.entries(monthlyStats)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 12) // 最新12ヶ月

  // 占い師別の鑑定回数ランキング
  const { data: divinationsByFortuneTeller } = await supabase
    .from('divination_results')
    .select('fortune_teller_id, fortune_tellers(name, avatar_url)')

  const fortuneTellerStats: Record<string, { name: string; count: number }> = {}
  divinationsByFortuneTeller?.forEach((div: any) => {
    if (!div.fortune_teller_id || !div.fortune_tellers) return
    if (!fortuneTellerStats[div.fortune_teller_id]) {
      fortuneTellerStats[div.fortune_teller_id] = {
        name: div.fortune_tellers.name,
        count: 0,
      }
    }
    fortuneTellerStats[div.fortune_teller_id].count++
  })

  const fortuneTellerRanking = Object.entries(fortuneTellerStats)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  // 総売上計算
  const totalRevenue = allTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0

  // 今月の売上
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)

  const { data: thisMonthTransactions } = await supabase
    .from('points_transactions')
    .select('amount')
    .eq('transaction_type', 'purchase')
    .gte('created_at', thisMonth.toISOString())

  const thisMonthRevenue = thisMonthTransactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0

  return (
    <div className="space-y-8">
      {/* ヘッダー */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">売上分析</h1>
        <p className="mt-2 text-gray-600">収益データと占い師パフォーマンスを分析</p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">総売上</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ¥{totalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">今月の売上</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ¥{thisMonthRevenue.toLocaleString()}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase">取引数</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {allTransactions?.length || 0}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 日別売上グラフ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">日別売上（最新30日）</h2>
        <div className="space-y-2">
          {dailyData.slice(0, 10).map(([date, amount]) => (
            <div key={date} className="flex items-center gap-4">
              <p className="text-sm text-gray-600 w-32">{date}</p>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full flex items-center justify-end pr-3"
                  style={{
                    width: `${Math.min((amount / Math.max(...dailyData.map(([, a]) => a))) * 100, 100)}%`,
                  }}
                >
                  <span className="text-xs font-bold text-white">
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 月別売上グラフ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">月別売上</h2>
        <div className="space-y-3">
          {monthlyData.map(([month, amount]) => (
            <div key={month} className="flex items-center gap-4">
              <p className="text-sm text-gray-600 w-40">{month}</p>
              <div className="flex-1 bg-gray-100 rounded-full h-10 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full flex items-center justify-end pr-4"
                  style={{
                    width: `${Math.min((amount / Math.max(...monthlyData.map(([, a]) => a))) * 100, 100)}%`,
                  }}
                >
                  <span className="text-sm font-bold text-white">
                    ¥{amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 占い師別ランキング */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">占い師別鑑定回数ランキング</h2>
        </div>
        <div className="space-y-3">
          {fortuneTellerRanking.map((ft, index) => (
            <div
              key={ft.id}
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl"
            >
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{ft.name}</p>
                <p className="text-sm text-gray-600">{ft.count}回の鑑定</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">{ft.count}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
