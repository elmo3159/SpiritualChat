'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  checkMessageLimit,
  incrementMessageCount,
} from '@/lib/supabase/message-limits'
import { generateAndSaveAIResponse } from '@/lib/ai/generate-response'

/**
 * メッセージ送信レスポンスの型定義
 */
export interface SendMessageResponse {
  success: boolean
  message?: string
  data?: {
    id: string
    created_at: string
  }
  remainingCount?: number
}

/**
 * メッセージ取得レスポンスの型定義
 */
export interface GetMessagesResponse {
  success: boolean
  message?: string
  data?: Array<{
    id: string
    user_id: string
    fortune_teller_id: string
    sender_type: 'user' | 'fortune_teller'
    content: string
    is_divination_request: boolean
    created_at: string
  }>
}

/**
 * メッセージを送信するServer Action
 *
 * @param fortuneTellerId 占い師ID
 * @param content メッセージ内容
 * @param isDivinationRequest 占い依頼かどうか（デフォルト: false）
 * @returns 送信結果
 */
export async function sendMessage(
  fortuneTellerId: string,
  content: string,
  isDivinationRequest: boolean = false
): Promise<SendMessageResponse> {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        message: '認証エラー: ログインしてください',
      }
    }

    // メッセージのバリデーション
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        message: 'メッセージが空です',
      }
    }

    if (content.length > 1000) {
      return {
        success: false,
        message: 'メッセージは1000文字以内で入力してください',
      }
    }

    // メッセージ送信回数制限チェック
    const limitCheck = await checkMessageLimit(supabase, user.id, fortuneTellerId)

    if (!limitCheck.canSend) {
      return {
        success: false,
        message: limitCheck.message || 'メッセージ送信回数制限に達しました',
        remainingCount: 0,
      }
    }

    // メッセージをデータベースに保存
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'user',
        content: content.trim(),
        is_divination_request: isDivinationRequest,
      })
      .select('id, created_at')
      .single()

    if (error) {
      console.error('メッセージ送信エラー:', error)
      return {
        success: false,
        message: 'メッセージの送信に失敗しました',
      }
    }

    // メッセージ送信回数をインクリメント
    const incrementSuccess = await incrementMessageCount(
      supabase,
      user.id,
      fortuneTellerId
    )

    if (!incrementSuccess) {
      console.error('メッセージカウントの更新に失敗しましたが、メッセージは送信されました')
    }

    // AI応答を生成（非同期で実行、ブロックしない）
    // 占い依頼ではない通常メッセージの場合のみ自動応答を生成
    if (!isDivinationRequest) {
      generateAndSaveAIResponse(user.id, fortuneTellerId, content.trim()).catch(
        (error) => {
          console.error('AI応答生成の非同期実行でエラー:', error)
        }
      )
    }

    // チャットページをリバリデート
    revalidatePath(`/chat/${fortuneTellerId}`)

    return {
      success: true,
      data: {
        id: data.id,
        created_at: data.created_at,
      },
      remainingCount: limitCheck.remainingCount - 1, // 送信後の残り回数
    }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return {
      success: false,
      message: '予期しないエラーが発生しました',
    }
  }
}

/**
 * 特定の占い師とのメッセージ一覧を取得するServer Action
 *
 * @param fortuneTellerId 占い師ID
 * @param limit 取得件数（デフォルト: 100）
 * @returns メッセージ一覧
 */
export async function getMessages(
  fortuneTellerId: string,
  limit: number = 100
): Promise<GetMessagesResponse> {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        message: '認証エラー: ログインしてください',
      }
    }

    // メッセージを取得（作成日時の昇順）
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('メッセージ取得エラー:', error)
      return {
        success: false,
        message: 'メッセージの取得に失敗しました',
      }
    }

    return {
      success: true,
      data: data || [],
    }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return {
      success: false,
      message: '予期しないエラーが発生しました',
    }
  }
}
