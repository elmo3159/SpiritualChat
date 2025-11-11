import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAndSaveAIResponse } from '@/lib/ai/generate-response'
import {
  checkMessageLimit,
  incrementMessageCount,
  MAX_MESSAGES_PER_DAY,
} from '@/lib/supabase/message-limits'

/**
 * メッセージ送信API
 *
 * POST /api/chat/send-message
 *
 * ユーザーからのメッセージを保存し、
 * AI占い師からの自動応答を生成します
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディを取得
    const body = await request.json()
    const { fortuneTellerId, content } = body

    if (!fortuneTellerId || !content) {
      return NextResponse.json(
        { success: false, message: '占い師IDとメッセージ内容が必要です' },
        { status: 400 }
      )
    }

    // メッセージ内容の長さチェック（1000文字まで）
    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'メッセージは1000文字以内で入力してください' },
        { status: 400 }
      )
    }

    // プロフィール取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'プロフィールが見つかりません' },
        { status: 404 }
      )
    }

    // 占い師の存在確認
    const { data: fortuneTeller, error: fortuneTellerError } = await supabase
      .from('fortune_tellers')
      .select('id, name')
      .eq('id', fortuneTellerId)
      .eq('is_active', true)
      .single()

    if (fortuneTellerError || !fortuneTeller) {
      return NextResponse.json(
        { success: false, message: '占い師が見つかりません' },
        { status: 404 }
      )
    }

    // メッセージ送信制限をチェック
    const limitCheck = await checkMessageLimit(
      supabase,
      profile.id,
      fortuneTellerId
    )

    if (!limitCheck.canSend) {
      return NextResponse.json(
        {
          success: false,
          message:
            limitCheck.message ||
            '本日のメッセージ送信回数の上限に達しました。鑑定結果を開封するとリセットされます。',
        },
        { status: 429 }
      )
    }

    // ユーザーメッセージを保存
    const { data: userMessage, error: userMessageError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: profile.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'user',
        content: content,
        is_divination_request: false,
      })
      .select()
      .single()

    if (userMessageError) {
      console.error('ユーザーメッセージ保存エラー:', userMessageError)
      return NextResponse.json(
        { success: false, message: 'メッセージの保存に失敗しました' },
        { status: 500 }
      )
    }

    // メッセージ送信回数を更新
    const incrementSuccess = await incrementMessageCount(
      supabase,
      profile.id,
      fortuneTellerId
    )

    if (!incrementSuccess) {
      console.error('メッセージカウント更新に失敗しました')
      // カウント更新失敗でもメッセージは保存されているのでエラーにはしない
    }

    // AI応答を生成（非同期で実行、すぐにレスポンスを返す）
    generateAndSaveAIResponse(profile.id, fortuneTellerId, content).catch(
      (error) => {
        console.error('AI応答生成の非同期実行でエラー:', error)
      }
    )

    return NextResponse.json({
      success: true,
      data: {
        message: userMessage,
        remaining_messages: Math.max(0, limitCheck.remainingCount - 1),
      },
    })
  } catch (error: any) {
    console.error('メッセージ送信エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'メッセージの送信に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

