import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyAdminPassword, generateAdminToken } from '@/lib/auth/admin'
import { logAdminAction } from '@/lib/security/audit-log'

/**
 * 管理者ログインAPI
 *
 * POST /api/admin/login
 * リクエストボディ: { email: string, password: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // バリデーション
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスとパスワードを入力してください',
        },
        { status: 400 }
      )
    }

    // Supabaseクライアント作成（service_roleキーで接続）
    const supabase = createAdminClient()

    // 管理者ユーザーを取得
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    console.log('[DEBUG] Admin user query result:', { adminUser, error })

    if (error || !adminUser) {
      console.log('[DEBUG] Admin user not found or error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
        { status: 401 }
      )
    }

    // パスワード検証
    const isPasswordValid = await verifyAdminPassword(
      password,
      adminUser.password_hash
    )

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: 'メールアドレスまたはパスワードが正しくありません',
        },
        { status: 401 }
      )
    }

    // JWTトークン生成
    const token = generateAdminToken(adminUser.id, adminUser.email, adminUser.role)

    // 最終ログイン日時を更新
    await supabase
      .from('admin_users')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', adminUser.id)

    // 監査ログを記録
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await logAdminAction(adminUser.id, adminUser.email, 'admin_login', {
      ipAddress,
      userAgent,
      status: 'success',
    })

    // レスポンスを作成してCookieを設定
    const response = NextResponse.json({
      success: true,
      data: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      },
    })

    // Cookieにトークンを保存（httpOnly、secure、7日間有効）
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7日間
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'ログイン処理中にエラーが発生しました',
      },
      { status: 500 }
    )
  }
}
