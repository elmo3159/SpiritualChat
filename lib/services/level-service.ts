import { createAdminClient } from '@/lib/supabase/server'
import { calculateLevel, calculateExpForLevel, calculateExpToNextLevel, calculateLevelProgress } from './badge-service'
import { createLevelUpNotification } from './notification-service'

export interface UserLevel {
  id: string
  user_id: string
  current_level: number
  current_exp: number
  total_points_used: number
  updated_at: string
  created_at: string
}

/**
 * ユーザーのレベル情報を取得
 */
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('レベル情報取得エラー:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('レベル情報取得エラー:', error)
    return null
  }
}

/**
 * ポイント使用時にレベルを更新
 */
export async function updateLevelOnPointsUsed(userId: string, pointsUsed: number): Promise<void> {
  const supabase = createAdminClient()

  try {
    // 現在のレベル情報を取得
    let { data: levelData } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', userId)
      .single()

    // レベル情報が存在しない場合は作成
    if (!levelData) {
      const { data: newLevelData, error: createError } = await supabase
        .from('user_levels')
        .insert({
          user_id: userId,
          current_level: 1,
          current_exp: 0,
          total_points_used: 0,
        })
        .select()
        .single()

      if (createError) {
        console.error('レベル情報作成エラー:', createError)
        return
      }

      levelData = newLevelData
    }

    // ポイント使用を経験値に変換（1pt = 1exp）
    const expGained = pointsUsed
    const newTotalPointsUsed = levelData.total_points_used + pointsUsed
    const newExp = levelData.current_exp + expGained
    const newLevel = calculateLevel(newExp)

    // レベル情報を更新
    await supabase
      .from('user_levels')
      .update({
        current_level: newLevel,
        current_exp: newExp,
        total_points_used: newTotalPointsUsed,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    // レベルアップした場合はバッジチェックと通知作成
    if (newLevel > levelData.current_level) {
      // レベル関連のバッジチェックは次回のバッジチェックで行われる
      console.log(`[レベルアップ] ユーザーID: ${userId}, ${levelData.current_level} -> ${newLevel}`)

      // レベルアップ通知を作成
      const levelTitle = getLevelTitle(newLevel)
      const notificationCreated = await createLevelUpNotification(userId, levelData.current_level, newLevel, levelTitle)

      if (notificationCreated) {
        console.log(`[レベルアップ通知作成成功] ユーザーID: ${userId}, レベル: ${newLevel}`)
      } else {
        console.error(`[レベルアップ通知作成失敗] ユーザーID: ${userId}, レベル: ${newLevel}`)
      }
    }
  } catch (error) {
    console.error('レベル更新エラー:', error)
  }
}

/**
 * レベル情報の詳細を取得（進捗率などを含む）
 */
export async function getLevelDetails(userId: string) {
  const levelData = await getUserLevel(userId)

  if (!levelData) {
    return {
      currentLevel: 1,
      currentExp: 0,
      totalPointsUsed: 0,
      expForCurrentLevel: 0,
      expForNextLevel: 1000,
      expToNextLevel: 1000,
      progressPercentage: 0,
    }
  }

  const { current_level, current_exp, total_points_used } = levelData

  return {
    currentLevel: current_level,
    currentExp: current_exp,
    totalPointsUsed: total_points_used,
    expForCurrentLevel: calculateExpForLevel(current_level),
    expForNextLevel: calculateExpForLevel(current_level + 1),
    expToNextLevel: calculateExpToNextLevel(current_exp),
    progressPercentage: calculateLevelProgress(current_exp),
  }
}

/**
 * レベルに応じた称号を取得
 */
export function getLevelTitle(level: number): string {
  if (level >= 100) return '伝説の占い師'
  if (level >= 75) return '神秘の求道者'
  if (level >= 50) return '運命の探究者'
  if (level >= 25) return '占いの達人'
  if (level >= 10) return '占いの修行者'
  if (level >= 5) return '占い初級者'
  return '占いの門下生'
}

/**
 * レベルに応じた色を取得（Tailwindクラス用）
 */
export function getLevelColor(level: number): string {
  if (level >= 100) return 'from-yellow-400 to-orange-500' // レジェンド
  if (level >= 50) return 'from-purple-500 to-pink-500' // エピック
  if (level >= 25) return 'from-blue-500 to-cyan-500' // レア
  return 'from-green-500 to-emerald-500' // コモン
}
