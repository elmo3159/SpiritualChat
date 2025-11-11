import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * ログイン履歴API
 *
 * GET: ユーザーのログイン履歴を取得
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未認証' }, { status: 401 })
    }

    // ログイン履歴を取得
    const { data: loginHistory, error } = await supabase
      .from('login_history')
      .select('*')
      .eq('user_id', user.id)
      .order('login_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json({ loginHistory: loginHistory || [] })
  } catch (error) {
    console.error('ログイン履歴取得エラー:', error)
    return NextResponse.json(
      { error: 'ログイン履歴の取得に失敗しました' },
      { status: 500 }
    )
  }
}
