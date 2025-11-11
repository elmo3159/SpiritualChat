import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsContent from './SettingsContent'

/**
 * 設定ページ
 *
 * ユーザーの各種設定を管理します
 */

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // ユーザーポイントを取得
  const { data: userPoints } = await supabase
    .from('user_points')
    .select('points_balance')
    .eq('user_id', user.id)
    .single()

  // 最近のポイント購入履歴を取得
  const { data: recentTransactions } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('transaction_type', 'purchase')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <SettingsContent
      userEmail={user.email || ''}
      pointsBalance={userPoints?.points_balance || 0}
      recentTransactions={recentTransactions || []}
    />
  )
}
