import { createAdminClient } from '@/lib/supabase/server'
import { createBadgeEarnedNotification, createPointsAwardedNotification, createExpAwardedNotification } from './notification-service'

export interface BadgeDefinition {
  badge_key: string
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  bonus_points: number
  bonus_exp: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserBadge {
  id: string
  user_id: string
  badge_key: string
  earned_at: string
  bonus_points_claimed: boolean
  bonus_exp_claimed: boolean
  badge_definitions: BadgeDefinition
}

export interface UnearnedBadge {
  badge_key: string
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  bonus_points: number
  bonus_exp: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  current_progress: number
  progress_percentage: number
  requirement_text: string
}

/**
 * ユーザーの統計を取得してバッジ獲得条件を確認
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const supabase = createAdminClient()
  const newBadges: string[] = []

  try {
    // すでに獲得しているバッジを取得
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_key')
      .eq('user_id', userId)

    const earnedBadgeKeys = new Set(earnedBadges?.map(b => b.badge_key) || [])

    // 鑑定回数を取得
    const { count: divinationCount } = await supabase
      .from('divination_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 今日の運勢回数を取得
    const { count: dailyFortuneCount } = await supabase
      .from('daily_fortunes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // ポイント購入回数を取得
    const { count: purchaseCount } = await supabase
      .from('points_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('transaction_type', 'purchase')

    // 合計購入ポイント数を取得
    const { data: purchaseData } = await supabase
      .from('points_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'purchase')

    const totalPurchasedPoints = purchaseData?.reduce((sum, t) => sum + t.amount, 0) || 0

    // プロフィールの完成度チェック
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const isProfileComplete = profile &&
      profile.nickname &&
      profile.birth_date &&
      profile.gender &&
      profile.concern_category &&
      profile.concern_description

    // 占い師ごとの相談回数を取得（全占い師制覇バッジ用）
    const { data: fortuneTellerStats } = await supabase
      .from('divination_results')
      .select('fortune_teller_id')
      .eq('user_id', userId)

    const fortuneTellerCounts: Record<string, number> = {}
    fortuneTellerStats?.forEach(stat => {
      fortuneTellerCounts[stat.fortune_teller_id] = (fortuneTellerCounts[stat.fortune_teller_id] || 0) + 1
    })

    const usedFortuneTellerCount = Object.keys(fortuneTellerCounts).length

    // 全占い師数を取得
    const { count: totalFortuneTellers } = await supabase
      .from('fortune_tellers')
      .select('*', { count: 'exact', head: true })

    const allFortuneTellersUsed = usedFortuneTellerCount === totalFortuneTellers && totalFortuneTellers > 0

    // レベル情報を取得
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('current_level')
      .eq('user_id', userId)
      .single()

    const currentLevel = levelData?.current_level || 1

    // 連続ログイン日数を計算
    const { data: loginHistory } = await supabase
      .from('login_history')
      .select('login_at')
      .eq('user_id', userId)
      .order('login_at', { ascending: false })

    let loginStreak = 0
    if (loginHistory && loginHistory.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let currentDate = new Date(today)
      let streak = 0

      for (const login of loginHistory) {
        const loginDate = new Date(login.login_at)
        loginDate.setHours(0, 0, 0, 0)

        // 現在チェック中の日付と一致するか確認
        if (loginDate.getTime() === currentDate.getTime()) {
          streak++
          // 前日をチェック
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (loginDate.getTime() < currentDate.getTime()) {
          // 連続が途切れた
          break
        }
      }

      loginStreak = streak
    }

    // 朝の時間帯チェック（5:00-11:59）と夜の時間帯チェック（18:00-23:59）
    const { data: morningLogins } = await supabase
      .from('login_history')
      .select('login_at')
      .eq('user_id', userId)

    let hasMorningCheck = false
    let hasNightCheck = false

    if (morningLogins && morningLogins.length > 0) {
      for (const login of morningLogins) {
        const loginDate = new Date(login.login_at)
        const hour = loginDate.getHours()

        if (hour >= 5 && hour < 12) {
          hasMorningCheck = true
        }
        if (hour >= 18 && hour < 24) {
          hasNightCheck = true
        }

        if (hasMorningCheck && hasNightCheck) break
      }
    }

    // カテゴリ別の相談回数を取得
    const { data: categoryConsultations } = await supabase
      .from('divination_results')
      .select('id')
      .eq('user_id', userId)

    // プロフィールからユーザーの悩みカテゴリを取得して、そのカテゴリでの相談回数をカウント
    const concernCategory = profile?.concern_category
    let categoryLoveCount = 0
    let categoryWorkCount = 0
    let categoryMoneyCount = 0

    if (concernCategory) {
      const loveCategories = ['恋愛', '片思い', '復縁', '不倫/浮気', '結婚']
      const workCategories = ['仕事']
      const moneyCategories = ['金運']

      if (loveCategories.includes(concernCategory)) {
        categoryLoveCount = categoryConsultations?.length || 0
      } else if (workCategories.includes(concernCategory)) {
        categoryWorkCount = categoryConsultations?.length || 0
      } else if (moneyCategories.includes(concernCategory)) {
        categoryMoneyCount = categoryConsultations?.length || 0
      }
    }

    // バッジ定義を取得
    const { data: badgeDefinitions } = await supabase
      .from('badge_definitions')
      .select('*')

    // 各バッジの獲得条件をチェック
    for (const badge of badgeDefinitions || []) {
      if (earnedBadgeKeys.has(badge.badge_key)) continue

      let shouldAward = false

      switch (badge.condition_type) {
        case 'divination_count':
          shouldAward = (divinationCount || 0) >= badge.condition_value
          break
        case 'daily_fortune_count':
          shouldAward = (dailyFortuneCount || 0) >= badge.condition_value
          break
        case 'purchase_count':
          shouldAward = (purchaseCount || 0) >= badge.condition_value
          break
        case 'total_purchased_points':
          shouldAward = totalPurchasedPoints >= badge.condition_value
          break
        case 'profile_complete':
          shouldAward = isProfileComplete
          break
        case 'all_fortune_tellers':
          shouldAward = allFortuneTellersUsed
          break
        case 'level':
          shouldAward = currentLevel >= badge.condition_value
          break
        case 'login_streak':
          shouldAward = loginStreak >= badge.condition_value
          break
        case 'morning_check':
          shouldAward = hasMorningCheck
          break
        case 'night_check':
          shouldAward = hasNightCheck
          break
        case 'category_love':
          shouldAward = categoryLoveCount >= badge.condition_value
          break
        case 'category_work':
          shouldAward = categoryWorkCount >= badge.condition_value
          break
        case 'category_money':
          shouldAward = categoryMoneyCount >= badge.condition_value
          break
      }

      if (shouldAward) {
        // バッジを付与
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_key: badge.badge_key,
          })

        if (!error) {
          newBadges.push(badge.badge_key)

          // バッジ獲得通知を作成
          await createBadgeEarnedNotification(
            userId,
            badge.badge_key,
            badge.name,
            badge.description
          )

          // ボーナスポイントを付与
          if (badge.bonus_points > 0) {
            await awardBonusPoints(userId, badge.bonus_points, badge.badge_key)
          }

          // ボーナス経験値を付与
          if (badge.bonus_exp > 0) {
            await awardBonusExp(userId, badge.bonus_exp)
          }
        }
      }
    }

    return newBadges
  } catch (error) {
    console.error('バッジチェックエラー:', error)
    return []
  }
}

/**
 * ボーナスポイントを付与
 */
async function awardBonusPoints(userId: string, points: number, badgeKey: string): Promise<void> {
  const supabase = createAdminClient()

  try {
    // ポイントを追加
    const { data: currentPoints } = await supabase
      .from('user_points')
      .select('points_balance')
      .eq('user_id', userId)
      .single()

    const newBalance = (currentPoints?.points_balance || 0) + points

    await supabase
      .from('user_points')
      .update({ points_balance: newBalance })
      .eq('user_id', userId)

    // トランザクション記録
    await supabase
      .from('points_transactions')
      .insert({
        user_id: userId,
        transaction_type: 'bonus',
        amount: points,
        description: `バッジ獲得ボーナス: ${badgeKey}`,
      })

    // バッジのボーナスポイント請求済みフラグを立てる
    await supabase
      .from('user_badges')
      .update({ bonus_points_claimed: true })
      .eq('user_id', userId)
      .eq('badge_key', badgeKey)

    // ポイント付与通知を作成
    await createPointsAwardedNotification(userId, points, 'バッジ獲得ボーナス')
  } catch (error) {
    console.error('ボーナスポイント付与エラー:', error)
  }
}

/**
 * ボーナス経験値を付与
 */
async function awardBonusExp(userId: string, exp: number): Promise<void> {
  const supabase = createAdminClient()

  try {
    const { data: levelData } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (levelData) {
      const newExp = levelData.current_exp + exp
      const newLevel = calculateLevel(newExp)

      await supabase
        .from('user_levels')
        .update({
          current_exp: newExp,
          current_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      // 経験値付与通知を作成
      await createExpAwardedNotification(userId, exp, 'バッジ獲得ボーナス')
    }
  } catch (error) {
    console.error('ボーナス経験値付与エラー:', error)
  }
}

/**
 * 経験値からレベルを計算
 * 1レベル = 1000経験値
 */
export function calculateLevel(exp: number): number {
  return Math.floor(exp / 1000) + 1
}

/**
 * レベルから必要経験値を計算
 */
export function calculateExpForLevel(level: number): number {
  return (level - 1) * 1000
}

/**
 * 次のレベルまでの経験値を計算
 */
export function calculateExpToNextLevel(currentExp: number): number {
  const currentLevel = calculateLevel(currentExp)
  const expForNextLevel = calculateExpForLevel(currentLevel + 1)
  return expForNextLevel - currentExp
}

/**
 * レベルゲージの進捗率を計算（0-100）
 */
export function calculateLevelProgress(currentExp: number): number {
  const currentLevel = calculateLevel(currentExp)
  const expForCurrentLevel = calculateExpForLevel(currentLevel)
  const expForNextLevel = calculateExpForLevel(currentLevel + 1)
  const expInCurrentLevel = currentExp - expForCurrentLevel
  const expNeededForNextLevel = expForNextLevel - expForCurrentLevel

  return (expInCurrentLevel / expNeededForNextLevel) * 100
}

/**
 * 未獲得バッジの一覧と進捗状況を取得
 */
export async function getUnearnedBadges(userId: string): Promise<UnearnedBadge[]> {
  const supabase = createAdminClient()
  const unearnedBadges: UnearnedBadge[] = []

  try {
    // すでに獲得しているバッジを取得
    const { data: earnedBadges } = await supabase
      .from('user_badges')
      .select('badge_key')
      .eq('user_id', userId)

    const earnedBadgeKeys = new Set(earnedBadges?.map(b => b.badge_key) || [])

    // 統計データを取得
    const { count: divinationCount } = await supabase
      .from('divination_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: dailyFortuneCount } = await supabase
      .from('daily_fortunes')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const { count: purchaseCount } = await supabase
      .from('points_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('transaction_type', 'purchase')

    const { data: purchaseData } = await supabase
      .from('points_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('transaction_type', 'purchase')

    const totalPurchasedPoints = purchaseData?.reduce((sum, t) => sum + t.amount, 0) || 0

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const isProfileComplete = profile &&
      profile.nickname &&
      profile.birth_date &&
      profile.gender &&
      profile.concern_category &&
      profile.concern_description

    const { data: fortuneTellerStats } = await supabase
      .from('divination_results')
      .select('fortune_teller_id')
      .eq('user_id', userId)

    const fortuneTellerCounts: Record<string, number> = {}
    fortuneTellerStats?.forEach(stat => {
      fortuneTellerCounts[stat.fortune_teller_id] = (fortuneTellerCounts[stat.fortune_teller_id] || 0) + 1
    })

    const usedFortuneTellerCount = Object.keys(fortuneTellerCounts).length

    const { count: totalFortuneTellers } = await supabase
      .from('fortune_tellers')
      .select('*', { count: 'exact', head: true })

    const { data: levelData } = await supabase
      .from('user_levels')
      .select('current_level')
      .eq('user_id', userId)
      .single()

    const currentLevel = levelData?.current_level || 1

    // 連続ログイン日数を計算
    const { data: loginHistory } = await supabase
      .from('login_history')
      .select('login_at')
      .eq('user_id', userId)
      .order('login_at', { ascending: false })

    let loginStreak = 0
    if (loginHistory && loginHistory.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let currentDate = new Date(today)
      let streak = 0

      for (const login of loginHistory) {
        const loginDate = new Date(login.login_at)
        loginDate.setHours(0, 0, 0, 0)

        if (loginDate.getTime() === currentDate.getTime()) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (loginDate.getTime() < currentDate.getTime()) {
          break
        }
      }

      loginStreak = streak
    }

    // 朝の時間帯チェックと夜の時間帯チェック
    const { data: morningLogins } = await supabase
      .from('login_history')
      .select('login_at')
      .eq('user_id', userId)

    let hasMorningCheck = false
    let hasNightCheck = false

    if (morningLogins && morningLogins.length > 0) {
      for (const login of morningLogins) {
        const loginDate = new Date(login.login_at)
        const hour = loginDate.getHours()

        if (hour >= 5 && hour < 12) {
          hasMorningCheck = true
        }
        if (hour >= 18 && hour < 24) {
          hasNightCheck = true
        }

        if (hasMorningCheck && hasNightCheck) break
      }
    }

    // カテゴリ別の相談回数を取得
    const { data: categoryConsultations } = await supabase
      .from('divination_results')
      .select('id')
      .eq('user_id', userId)

    const concernCategory = profile?.concern_category
    let categoryLoveCount = 0
    let categoryWorkCount = 0
    let categoryMoneyCount = 0

    if (concernCategory) {
      const loveCategories = ['恋愛', '片思い', '復縁', '不倫/浮気', '結婚']
      const workCategories = ['仕事']
      const moneyCategories = ['金運']

      if (loveCategories.includes(concernCategory)) {
        categoryLoveCount = categoryConsultations?.length || 0
      } else if (workCategories.includes(concernCategory)) {
        categoryWorkCount = categoryConsultations?.length || 0
      } else if (moneyCategories.includes(concernCategory)) {
        categoryMoneyCount = categoryConsultations?.length || 0
      }
    }

    // バッジ定義を取得
    const { data: badgeDefinitions } = await supabase
      .from('badge_definitions')
      .select('*')
      .order('condition_value', { ascending: true })

    // 未獲得バッジをフィルタリングして進捗を計算
    for (const badge of badgeDefinitions || []) {
      if (earnedBadgeKeys.has(badge.badge_key)) continue

      let currentProgress = 0
      let requirementText = ''

      switch (badge.condition_type) {
        case 'divination_count':
          currentProgress = divinationCount || 0
          requirementText = `鑑定を${badge.condition_value}回受ける`
          break
        case 'daily_fortune_count':
          currentProgress = dailyFortuneCount || 0
          requirementText = `今日の運勢を${badge.condition_value}回占う`
          break
        case 'purchase_count':
          currentProgress = purchaseCount || 0
          requirementText = `ポイントを${badge.condition_value}回購入する`
          break
        case 'total_purchased_points':
          currentProgress = totalPurchasedPoints
          requirementText = `合計${badge.condition_value.toLocaleString()}pt購入する`
          break
        case 'profile_complete':
          currentProgress = isProfileComplete ? 1 : 0
          requirementText = 'すべてのプロフィール項目を入力する'
          break
        case 'all_fortune_tellers':
          currentProgress = usedFortuneTellerCount
          requirementText = `すべての占い師（${totalFortuneTellers || 0}人）に相談する`
          break
        case 'level':
          currentProgress = currentLevel
          requirementText = `レベル${badge.condition_value}に到達する`
          break
        case 'login_streak':
          currentProgress = loginStreak
          requirementText = `${badge.condition_value}日連続でログインする`
          break
        case 'morning_check':
          currentProgress = hasMorningCheck ? 1 : 0
          requirementText = badge.description || '朝の時間帯（5:00-11:59）にログインする'
          break
        case 'night_check':
          currentProgress = hasNightCheck ? 1 : 0
          requirementText = badge.description || '夜の時間帯（18:00-23:59）にログインする'
          break
        case 'category_love':
          currentProgress = categoryLoveCount
          requirementText = `恋愛カテゴリで${badge.condition_value}回相談する`
          break
        case 'category_work':
          currentProgress = categoryWorkCount
          requirementText = `仕事カテゴリで${badge.condition_value}回相談する`
          break
        case 'category_money':
          currentProgress = categoryMoneyCount
          requirementText = `金運カテゴリで${badge.condition_value}回相談する`
          break
      }

      const progressPercentage = Math.min((currentProgress / badge.condition_value) * 100, 100)

      unearnedBadges.push({
        badge_key: badge.badge_key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        condition_type: badge.condition_type,
        condition_value: badge.condition_value,
        bonus_points: badge.bonus_points,
        bonus_exp: badge.bonus_exp,
        rarity: badge.rarity,
        current_progress: currentProgress,
        progress_percentage: progressPercentage,
        requirement_text: requirementText,
      })
    }

    return unearnedBadges
  } catch (error) {
    console.error('未獲得バッジ取得エラー:', error)
    return []
  }
}
