import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * ログイン試行チェックAPI
 *
 * Stripe審査対応：ログイン試行回数制限（10回以下でアカウントロック）
 *
 * POST /api/security/check-login-attempt
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, success } = body

    if (!email) {
      return NextResponse.json(
        { error: 'メールアドレスが必要です' },
        { status: 400 }
      )
    }

    // IPアドレスを取得
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'

    const supabase = await createClient()

    // ログイン試行をチェック・記録
    const { data, error } = await supabase.rpc('check_and_record_login_attempt', {
      p_email: email,
      p_ip_address: ipAddress,
      p_success: success || false,
    })

    if (error) {
      console.error('ログイン試行チェックエラー:', error)
      return NextResponse.json(
        { error: 'ログイン試行のチェックに失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('ログイン試行チェックエラー:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
