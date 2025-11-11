import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PointsHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: transactions } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const allTransactions = transactions || []
  const totalPurchased = allTransactions.filter(t => t.transaction_type === 'purchase').reduce((sum, t) => sum + t.amount, 0)
  const totalConsumed = allTransactions.filter(t => t.transaction_type === 'consumption').reduce((sum, t) => sum + Math.abs(t.amount), 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-20">
      <header className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-lavender/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/points/purchase" className="p-2 rounded-full hover:bg-spiritual-light/20">
              <ArrowLeft className="w-6 h-6 text-gray-300" />
            </Link>
            <h1 className="text-xl font-bold bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent">
              ポイント履歴
            </h1>
          </div>
        </div>
      </header>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-2 border-green-500/30 rounded-2xl p-6">
            <TrendingUp className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-green-400">{totalPurchased.toLocaleString()}<span className="text-sm ml-1">pt</span></p>
            <p className="text-xs text-gray-300">チャージ合計</p>
          </div>
          <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border-2 border-red-500/30 rounded-2xl p-6">
            <TrendingDown className="w-6 h-6 text-red-400 mb-2" />
            <p className="text-2xl font-bold text-red-400">{totalConsumed.toLocaleString()}<span className="text-sm ml-1">pt</span></p>
            <p className="text-xs text-gray-300">使用合計</p>
          </div>
        </div>
        <div className="bg-spiritual-purple/50 border-2 border-spiritual-lavender/30 rounded-2xl">
          <div className="p-4 border-b border-spiritual-lavender/30 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-spiritual-gold" />
            <h2 className="font-bold text-white">取引履歴</h2>
          </div>
          <div className="divide-y divide-spiritual-lavender/20">
            {allTransactions.length === 0 ? (
              <p className="p-8 text-center text-spiritual-lavender">履歴がありません</p>
            ) : (
              allTransactions.map(t => (
                <div key={t.id} className="p-4 flex justify-between">
                  <div>
                    <p className="font-semibold text-white">{t.transaction_type === 'purchase' ? 'チャージ' : '使用'}</p>
                    <p className="text-xs text-gray-400">{new Date(t.created_at).toLocaleDateString('ja-JP')}</p>
                  </div>
                  <p className={`font-bold ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount} pt
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
