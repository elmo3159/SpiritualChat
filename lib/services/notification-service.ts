import { createAdminClient } from '@/lib/supabase/server'

/**
 * 通知タイプ
 */
export type NotificationType = 'new_message' | 'divination_ready' | 'points_low' | 'system' | 'level_up' | 'badge_earned' | 'points_awarded' | 'exp_awarded'

/**
 * 通知を作成
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  referenceType?: string,
  referenceId?: string
): Promise<boolean> {
  const supabase = createAdminClient()

  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      type,
      title,
      message,
      is_read: false,
      reference_type: referenceType,
      reference_id: referenceId,
    })

    if (error) {
      console.error('通知作成エラー:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('通知作成エラー:', error)
    return false
  }
}

/**
 * レベルアップ通知を作成
 */
export async function createLevelUpNotification(
  userId: string,
  oldLevel: number,
  newLevel: number,
  levelTitle: string
): Promise<boolean> {
  return createNotification(
    userId,
    'level_up',
    `レベルアップ！ Lv.${newLevel}`,
    `おめでとうございます！レベル${oldLevel}から${newLevel}に上がりました。称号「${levelTitle}」を獲得しました。`,
    'level',
    newLevel.toString()
  )
}

/**
 * バッジ獲得通知を作成
 */
export async function createBadgeEarnedNotification(
  userId: string,
  badgeId: string,
  badgeName: string,
  badgeDescription: string
): Promise<boolean> {
  return createNotification(
    userId,
    'badge_earned',
    `新しいバッジを獲得！`,
    `「${badgeName}」を獲得しました。${badgeDescription}`,
    'badge',
    badgeId
  )
}

/**
 * ポイント付与通知を作成
 */
export async function createPointsAwardedNotification(
  userId: string,
  points: number,
  reason: string
): Promise<boolean> {
  return createNotification(
    userId,
    'points_awarded',
    `ポイントを獲得！`,
    `${reason}で${points.toLocaleString()}ポイントを獲得しました。`,
    'points',
    points.toString()
  )
}

/**
 * 経験値付与通知を作成
 */
export async function createExpAwardedNotification(
  userId: string,
  exp: number,
  reason: string
): Promise<boolean> {
  return createNotification(
    userId,
    'exp_awarded',
    `経験値を獲得！`,
    `${reason}で${exp.toLocaleString()}EXPを獲得しました。`,
    'exp',
    exp.toString()
  )
}
