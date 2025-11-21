import { createClient } from '@/lib/supabase/server'
import FortuneTellerList from '@/app/components/fortune-tellers/FortuneTellerList'
import NotificationPanel from '@/app/components/notifications/NotificationPanel'
import HomeTabView from '@/app/components/HomeTabView'
import { getDailyFortune } from '@/app/actions/daily-fortune'
import type { FortuneTeller } from '@/lib/types/fortune-teller'
import Link from 'next/link'
import { getLevelDetails } from '@/lib/services/level-service'
import LevelGauge from '@/app/components/level/LevelGauge'
import Image from 'next/image'

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()

  // ユーザーポイントとレベルを取得
  const { data: { user } } = await supabase.auth.getUser()
  let currentPoints = 0
  let levelDetails = null

  if (user) {
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points_balance')
      .eq('user_id', user.id)
      .single()

    currentPoints = userPoints?.points_balance || 0

    // レベル情報を取得
    levelDetails = await getLevelDetails(user.id)
  }

  // 占い師一覧を取得
  const { data: fortuneTellers, error } = await supabase
    .from('fortune_tellers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('占い師データの取得エラー:', error)
  }

  // 今日の運勢を取得
  const today = new Date().toISOString().split('T')[0]
  const { fortune } = user ? await getDailyFortune(today) : { fortune: null }

  // 鑑定結果を開封したことがあるかチェック
  let hasUnlockedDivination = false
  let isNewUser = false
  if (user) {
    const { data: unlockedResults } = await supabase
      .from('divination_results')
      .select('id')
      .eq('user_id', user.id)
      .not('unlocked_at', 'is', null)
      .limit(1)

    hasUnlockedDivination = (unlockedResults?.length || 0) > 0

    // 新規ユーザーかチェック（プロフィール登録完了済み）
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single()

    isNewUser = profile?.onboarding_completed === true
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-16">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-lavender/30">
        <div className="container mx-auto px-4 py-3 md:py-5 pt-safe-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/images/logo.png?v=2"
                alt="スピチャ"
                width={200}
                height={70}
                className="w-auto h-10 md:h-12"
                priority
              />
            </div>
            <div className="flex items-center gap-1 md:gap-3">
              {/* 通知パネル */}
              {user && <NotificationPanel />}
              {/* ポイント表示（クリック可能） */}
              <Link
                href="/points/purchase"
                className="px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-full text-xs md:text-base font-bold shadow-lg flex items-center gap-1.5 md:gap-2 hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95"
              >
                <span>{currentPoints.toLocaleString()} pt</span>
              </Link>

              {/* ポイント追加ボタン */}
              <Link
                href="/points/purchase"
                className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-spiritual-gold to-spiritual-accent flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 active:scale-95"
                aria-label="ポイントを追加"
              >
                <span className="text-spiritual-dark text-lg md:text-xl font-bold">+</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-4 md:space-y-6">
        {/* レベルゲージ（ログイン時のみ） */}
        {levelDetails && (
          <Link href="/profile/stats" className="block">
            <LevelGauge
              currentLevel={levelDetails.currentLevel}
              currentExp={levelDetails.currentExp}
              expForNextLevel={levelDetails.expForNextLevel}
              expToNextLevel={levelDetails.expToNextLevel}
              progressPercentage={levelDetails.progressPercentage}
              compact
            />
          </Link>
        )}

        {/* タブビュー */}
        <HomeTabView
          fortuneTellers={(fortuneTellers as FortuneTeller[]) || []}
          fortune={fortune}
          currentPoints={currentPoints}
          today={today}
          hasUnlockedDivination={hasUnlockedDivination}
          isNewUser={isNewUser}
        />
      </div>
    </main>
  )
}
