import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Users, Award, Sparkles, Lock } from 'lucide-react'
import Image from 'next/image'
import { getLevelDetails } from '@/lib/services/level-service'
import { checkAndAwardBadges, getUnearnedBadges } from '@/lib/services/badge-service'
import LevelGauge from '@/app/components/level/LevelGauge'

// キャッシュを無効化
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * プロフィール統計ページ
 *
 * ユーザーの鑑定統計、占い師ランキング、バッジを表示します
 */
export default async function ProfileStatsPage() {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 鑑定回数を取得
  const { count: divinationCount } = await supabase
    .from('divination_results')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  // 占い師ごとの鑑定回数を取得
  const { data: divinationsByFortuneTeller } = await supabase
    .from('divination_results')
    .select('fortune_teller_id, fortune_tellers(name, avatar_url)')
    .eq('user_id', user.id)

  // 占い師ごとに集計
  const fortuneTellerStats: Record<
    string,
    { name: string; avatar_url: string; count: number }
  > = {}

  divinationsByFortuneTeller?.forEach((div: any) => {
    if (!div.fortune_teller_id || !div.fortune_tellers) return

    if (!fortuneTellerStats[div.fortune_teller_id]) {
      fortuneTellerStats[div.fortune_teller_id] = {
        name: div.fortune_tellers.name,
        avatar_url: div.fortune_tellers.avatar_url,
        count: 0,
      }
    }
    fortuneTellerStats[div.fortune_teller_id].count++
  })

  // ランキング順にソート
  const fortuneTellerRanking = Object.entries(fortuneTellerStats)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5) // トップ5のみ

  // カテゴリ別集計（プロフィールの悩みカテゴリから）
  const { data: profile } = await supabase
    .from('profiles')
    .select('worry_category')
    .eq('id', user.id)
    .single()

  // ポイント使用統計
  const { data: pointsData } = await supabase
    .from('user_points')
    .select('points_balance')
    .eq('user_id', user.id)
    .single()

  const { count: purchaseCount } = await supabase
    .from('points_transactions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('transaction_type', 'purchase')

  // バッジをチェックして付与（新しいバッジがあれば）
  await checkAndAwardBadges(user.id)

  // 獲得済みバッジを取得
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('*, badge_definitions(*)')
    .eq('user_id', user.id)
    .order('earned_at', { ascending: false })

  const badges = userBadges?.map((ub: any) => ({
    id: ub.badge_key,
    name: ub.badge_definitions.name,
    icon: ub.badge_definitions.icon,
    description: ub.badge_definitions.description,
    rarity: ub.badge_definitions.rarity,
    earnedAt: ub.earned_at,
  })) || []

  // レベル情報を取得
  const levelDetails = await getLevelDetails(user.id)

  // 未獲得バッジを取得
  const unearnedBadges = await getUnearnedBadges(user.id)

  const stats = {
    divinationCount: divinationCount || 0,
    fortuneTellerRanking,
    worryCategory: profile?.worry_category || null,
    currentPoints: pointsData?.points_balance || 0,
    badges,
    unearnedBadges,
    levelDetails,
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-lavender/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 hover:bg-spiritual-light/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              あなたの統計
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* レベルゲージ */}
        <LevelGauge
          currentLevel={stats.levelDetails.currentLevel}
          currentExp={stats.levelDetails.currentExp}
          expForNextLevel={stats.levelDetails.expForNextLevel}
          expToNextLevel={stats.levelDetails.expToNextLevel}
          progressPercentage={stats.levelDetails.progressPercentage}
        />

        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* 鑑定回数 */}
          <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/30 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
            <div className="flex flex-col items-center text-center">
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-spiritual-gold mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stats.divinationCount}
              </p>
              <p className="text-xs md:text-sm text-spiritual-lavender">
                鑑定回数
              </p>
            </div>
          </div>

          {/* バッジ数 */}
          <div className="bg-gradient-to-br from-spiritual-accent/30 to-spiritual-gold/30 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-gold/30">
            <div className="flex flex-col items-center text-center">
              <Award className="w-8 h-8 md:w-10 md:h-10 text-spiritual-gold mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stats.badges.length}
              </p>
              <p className="text-xs md:text-sm text-spiritual-lavender">
                獲得バッジ
              </p>
            </div>
          </div>

          {/* お気に入り占い師数 */}
          <div className="bg-gradient-to-br from-pink-500/30 to-rose-500/30 backdrop-blur-sm rounded-2xl p-6 border border-pink-500/30">
            <div className="flex flex-col items-center text-center">
              <Users className="w-8 h-8 md:w-10 md:h-10 text-pink-400 mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stats.fortuneTellerRanking.length}
              </p>
              <p className="text-xs md:text-sm text-spiritual-lavender">
                利用占い師
              </p>
            </div>
          </div>

          {/* ポイント残高 */}
          <div className="bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 md:w-10 md:h-10 text-green-400 mb-3" />
              <p className="text-3xl md:text-4xl font-bold text-white mb-1">
                {stats.currentPoints.toLocaleString()}
              </p>
              <p className="text-xs md:text-sm text-spiritual-lavender">
                ポイント残高
              </p>
            </div>
          </div>
        </div>

        {/* 占い師ランキング */}
        {stats.fortuneTellerRanking.length > 0 && (
          <div className="bg-gradient-to-br from-spiritual-purple/20 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-spiritual-gold" />
              よく利用する占い師
            </h2>
            <div className="space-y-3">
              {stats.fortuneTellerRanking.map((ft: any, index: number) => (
                <div
                  key={ft.id}
                  className="flex items-center gap-3 p-3 bg-spiritual-dark/30 rounded-xl border border-spiritual-lavender/20"
                >
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-spiritual-gold/50">
                        <Image
                          src={ft.avatar_url || '/images/default-avatar.png'}
                          alt={ft.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-spiritual-gold rounded-full flex items-center justify-center text-xs font-bold text-spiritual-dark">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-semibold text-white truncate">
                      {ft.name}
                    </p>
                    <p className="text-xs text-spiritual-lavender">
                      {ft.count}回の鑑定
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* バッジ */}
        <div className="bg-gradient-to-br from-spiritual-purple/20 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-spiritual-gold" />
            獲得バッジ ({stats.badges.length}個)
          </h2>

          {stats.badges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.badges.map((badge: any) => {
                // レア度に応じた色を設定
                const getBadgeStyle = (rarity: string) => {
                  switch (rarity) {
                    case 'legendary':
                      return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
                    case 'epic':
                      return 'from-purple-500/20 to-pink-500/20 border-purple-500/50'
                    case 'rare':
                      return 'from-blue-500/20 to-cyan-500/20 border-blue-500/50'
                    default:
                      return 'from-green-500/20 to-emerald-500/20 border-green-500/50'
                  }
                }

                const getRarityLabel = (rarity: string) => {
                  switch (rarity) {
                    case 'legendary':
                      return 'レジェンド'
                    case 'epic':
                      return 'エピック'
                    case 'rare':
                      return 'レア'
                    default:
                      return 'コモン'
                  }
                }

                return (
                  <div
                    key={badge.id}
                    className={`relative flex items-start gap-3 p-4 bg-gradient-to-br ${getBadgeStyle(badge.rarity)} rounded-xl border backdrop-blur-sm`}
                  >
                    {/* レア度バッジ */}
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-bold text-white/60">
                        {getRarityLabel(badge.rarity)}
                      </span>
                    </div>

                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex-1 pr-16">
                      <h3 className="text-sm md:text-base font-bold text-white mb-1">
                        {badge.name}
                      </h3>
                      <p className="text-xs text-spiritual-lavender">
                        {badge.description}
                      </p>
                      <p className="text-xs text-spiritual-lavender/60 mt-1">
                        {new Date(badge.earnedAt).toLocaleDateString('ja-JP')} 獲得
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-spiritual-lavender/30 mx-auto mb-3" />
              <p className="text-sm text-spiritual-lavender">
                まだバッジを獲得していません
              </p>
              <p className="text-xs text-spiritual-lavender/70 mt-2">
                鑑定を受けたり、ポイントを購入してバッジを集めよう！
              </p>
            </div>
          )}
        </div>

        {/* 未獲得バッジ */}
        {stats.unearnedBadges.length > 0 && (
          <div className="bg-gradient-to-br from-spiritual-purple/20 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
            <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-spiritual-lavender" />
              未獲得バッジ ({stats.unearnedBadges.length}個)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.unearnedBadges.map((badge: any) => {
                // レア度に応じた色を設定（未獲得は少し暗め）
                const getBadgeStyle = (rarity: string) => {
                  switch (rarity) {
                    case 'legendary':
                      return 'from-yellow-900/20 to-orange-900/20 border-yellow-700/30'
                    case 'epic':
                      return 'from-purple-900/20 to-pink-900/20 border-purple-700/30'
                    case 'rare':
                      return 'from-blue-900/20 to-cyan-900/20 border-blue-700/30'
                    default:
                      return 'from-green-900/20 to-emerald-900/20 border-green-700/30'
                  }
                }

                const getRarityLabel = (rarity: string) => {
                  switch (rarity) {
                    case 'legendary':
                      return 'レジェンド'
                    case 'epic':
                      return 'エピック'
                    case 'rare':
                      return 'レア'
                    default:
                      return 'コモン'
                  }
                }

                return (
                  <div
                    key={badge.badge_key}
                    className={`relative flex flex-col gap-3 p-4 bg-gradient-to-br ${getBadgeStyle(badge.rarity)} rounded-xl border backdrop-blur-sm`}
                  >
                    {/* レア度バッジ */}
                    <div className="absolute top-2 right-2">
                      <span className="text-xs font-bold text-white/40">
                        {getRarityLabel(badge.rarity)}
                      </span>
                    </div>

                    {/* バッジ情報 */}
                    <div className="flex items-start gap-3">
                      <div className="text-4xl opacity-40 grayscale">{badge.icon}</div>
                      <div className="flex-1 pr-16">
                        <h3 className="text-sm md:text-base font-bold text-white/70 mb-1">
                          {badge.name}
                        </h3>
                        <p className="text-xs text-spiritual-lavender/60">
                          {badge.description}
                        </p>
                      </div>
                    </div>

                    {/* 獲得条件 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-spiritual-lavender/70">
                          {badge.requirement_text}
                        </span>
                        <span className="font-bold text-white/70">
                          {badge.current_progress} / {badge.condition_value}
                        </span>
                      </div>

                      {/* 進捗バー */}
                      <div className="relative h-2 bg-spiritual-dark/50 rounded-full overflow-hidden border border-spiritual-lavender/20">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-spiritual-lavender/50 to-spiritual-gold/50 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(badge.progress_percentage, 100)}%` }}
                        />
                      </div>

                      {/* 報酬情報 */}
                      <div className="flex items-center gap-3 text-xs text-spiritual-gold/70">
                        {badge.bonus_points > 0 && (
                          <span>🎁 {badge.bonus_points.toLocaleString()}pt</span>
                        )}
                        {badge.bonus_exp > 0 && (
                          <span>⭐ {badge.bonus_exp.toLocaleString()}exp</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 悩みカテゴリ */}
        {stats.worryCategory && (
          <div className="bg-gradient-to-br from-spiritual-purple/20 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
            <h2 className="text-lg md:text-xl font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-spiritual-gold" />
              相談カテゴリ
            </h2>
            <div className="inline-flex items-center px-4 py-2 bg-spiritual-gold/20 border border-spiritual-gold/50 rounded-full">
              <p className="text-sm md:text-base font-semibold text-white">
                {stats.worryCategory}
              </p>
            </div>
          </div>
        )}

        {/* メッセージ */}
        <div className="text-center py-8">
          <p className="text-sm md:text-base text-spiritual-lavender/80">
            これまでのあなたの占い体験をまとめました
          </p>
        </div>
      </div>
    </main>
  )
}
