/**
 * メッセージ送信回数制限ユーティリティ
 */

import { SupabaseClient } from '@supabase/supabase-js'

/**
 * 1日の最大メッセージ送信回数
 */
export const MAX_MESSAGES_PER_DAY = 3

/**
 * メッセージ送信回数チェック結果
 */
export interface MessageLimitCheck {
  canSend: boolean
  remainingCount: number
  currentCount: number
  message?: string
}

/**
 * ユーザーが今日メッセージを送信可能かチェック
 *
 * @param supabase - Supabaseクライアント
 * @param userId - ユーザーID
 * @param fortuneTellerId - 占い師ID
 * @returns チェック結果
 */
export async function checkMessageLimit(
  supabase: SupabaseClient,
  userId: string,
  fortuneTellerId: string
): Promise<MessageLimitCheck> {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD形式

    // 今日の送信回数を取得
    const { data, error } = await supabase
      .from('message_limits')
      .select('message_count')
      .eq('user_id', userId)
      .eq('fortune_teller_id', fortuneTellerId)
      .eq('target_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116はレコードが見つからない場合（初回送信）
      console.error('メッセージ制限チェックエラー:', error)
      // エラーの場合は送信を許可しない
      return {
        canSend: false,
        remainingCount: 0,
        currentCount: 0,
        message: '送信回数の確認に失敗しました',
      }
    }

    const currentCount = data?.message_count || 0

    if (currentCount >= MAX_MESSAGES_PER_DAY) {
      return {
        canSend: false,
        remainingCount: 0,
        currentCount,
        message: `本日の送信回数制限（${MAX_MESSAGES_PER_DAY}回）に達しました。明日再度お試しください。`,
      }
    }

    return {
      canSend: true,
      remainingCount: MAX_MESSAGES_PER_DAY - currentCount,
      currentCount,
    }
  } catch (error) {
    console.error('メッセージ制限チェック中の予期しないエラー:', error)
    return {
      canSend: false,
      remainingCount: 0,
      currentCount: 0,
      message: '予期しないエラーが発生しました',
    }
  }
}

/**
 * メッセージ送信回数を記録・更新
 *
 * @param supabase - Supabaseクライアント
 * @param userId - ユーザーID
 * @param fortuneTellerId - 占い師ID
 * @returns 成功した場合true
 */
export async function incrementMessageCount(
  supabase: SupabaseClient,
  userId: string,
  fortuneTellerId: string
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]

    // データベース関数を使用してカウントをインクリメント
    // この関数は新規作成時は1、既存レコード更新時はカウント+1を実行
    const { error } = await supabase.rpc('increment_message_count', {
      p_user_id: userId,
      p_fortune_teller_id: fortuneTellerId,
      p_target_date: today,
    })

    if (error) {
      console.error('メッセージカウント更新エラー:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('メッセージカウント記録中の予期しないエラー:', error)
    return false
  }
}

/**
 * ユーザーの今日の送信回数を取得
 *
 * @param supabase - Supabaseクライアント
 * @param userId - ユーザーID
 * @param fortuneTellerId - 占い師ID
 * @returns 送信回数
 */
export async function getTodayMessageCount(
  supabase: SupabaseClient,
  userId: string,
  fortuneTellerId: string
): Promise<number> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('message_limits')
      .select('message_count')
      .eq('user_id', userId)
      .eq('fortune_teller_id', fortuneTellerId)
      .eq('target_date', today)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('送信回数取得エラー:', error)
      return 0
    }

    return data?.message_count || 0
  } catch (error) {
    console.error('送信回数取得中の予期しないエラー:', error)
    return 0
  }
}

/**
 * メッセージ制限をリセット（鑑定結果開封時に使用）
 *
 * @param supabase - Supabaseクライアント
 * @param userId - ユーザーID
 * @param fortuneTellerId - 占い師ID
 * @returns 成功した場合true
 */
export async function resetMessageLimit(
  supabase: SupabaseClient,
  userId: string,
  fortuneTellerId: string
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]

    // 今日のレコードを削除（次回送信時に新規作成される）
    const { error } = await supabase
      .from('message_limits')
      .delete()
      .eq('user_id', userId)
      .eq('fortune_teller_id', fortuneTellerId)
      .eq('target_date', today)

    if (error) {
      console.error('メッセージ制限リセットエラー:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('メッセージ制限リセット中の予期しないエラー:', error)
    return false
  }
}
