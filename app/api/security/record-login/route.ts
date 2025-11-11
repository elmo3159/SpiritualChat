import { createClient } from '@/lib/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

/**
 * ログイン履歴記録API
 *
 * POST: ログイン履歴を記録
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未認証' }, { status: 401 })
    }

    // IPアドレスを取得
    const ip = request.headers.get('x-forwarded-for') ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // ユーザーエージェントを取得
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // ログイン履歴を記録
    const { error } = await supabase.from('login_history').insert({
      user_id: user.id,
      ip_address: ip,
      user_agent: userAgent,
      login_at: new Date().toISOString(),
      is_suspicious: false,
    })

    if (error) {
      console.error('ログイン履歴記録エラー:', error)
      return NextResponse.json(
        { error: 'ログイン履歴の記録に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('ログイン履歴記録エラー:', error)
    return NextResponse.json(
      { error: 'ログイン履歴の記録に失敗しました' },
      { status: 500 }
    )
  }
}
