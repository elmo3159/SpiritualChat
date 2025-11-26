import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkMessageLimit } from '@/lib/supabase/message-limits'

/**
 * メッセージ送信回数制限チェックAPI
 *
 * GET /api/chat/message-limit?fortuneTellerId=xxx
 *
 * ユーザーの今日の残りメッセージ送信回数を取得します
 */
export async function GET(request: NextRequest) {
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

    // クエリパラメータから占い師IDを取得
    const { searchParams } = new URL(request.url)
    const fortuneTellerId = searchParams.get('fortuneTellerId')

    if (!fortuneTellerId) {
      return NextResponse.json(
        { success: false, message: '占い師IDが必要です' },
        { status: 400 }
      )
    }

    // メッセージ送信回数制限をチェック
    const limitCheck = await checkMessageLimit(supabase, user.id, fortuneTellerId)

    return NextResponse.json({
      success: true,
      data: {
        canSend: limitCheck.canSend,
        remainingCount: limitCheck.remainingCount,
        currentCount: limitCheck.currentCount,
        message: limitCheck.message,
      },
    })
  } catch (error) {
    console.error('メッセージ制限チェックエラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'メッセージ制限の確認に失敗しました',
      },
      { status: 500 }
    )
  }
}
