import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * チャットメッセージ取得API
 *
 * GET /api/chat/messages?fortuneTellerId=xxx
 *
 * 特定の占い師とのチャットメッセージ一覧を取得します
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

    // クエリパラメータを取得
    const { searchParams } = new URL(request.url)
    const fortuneTellerId = searchParams.get('fortuneTellerId')

    if (!fortuneTellerId) {
      return NextResponse.json(
        { success: false, message: '占い師IDが必要です' },
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

    // メッセージ一覧を取得
    const { data: messages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', profile.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      console.error('メッセージ取得エラー:', messagesError)
      return NextResponse.json(
        { success: false, message: 'メッセージの取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        messages: messages || [],
      },
    })
  } catch (error: any) {
    console.error('メッセージ取得エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'メッセージの取得に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
