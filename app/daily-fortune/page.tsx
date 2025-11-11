import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getDailyFortune } from '@/app/actions/daily-fortune'
import DailyFortuneView from './DailyFortuneView'

/**
 * 今日の運勢ページ
 */
export default async function DailyFortunePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // ユーザーのポイント残高取得
  const { data: userPoints } = await supabase
    .from('user_points')
    .select('points_balance')
    .eq('user_id', user.id)
    .single()

  const currentPoints = userPoints?.points_balance || 0

  // 今日の運勢を取得
  const today = new Date().toISOString().split('T')[0]
  const { fortune } = await getDailyFortune(today)

  return (
    <DailyFortuneView
      fortune={fortune}
      currentPoints={currentPoints}
      today={today}
    />
  )
}
