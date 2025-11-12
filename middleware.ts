import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

/**
 * ベーシック認証チェック
 * 管理者画面のセキュリティ対策として実装
 */
function checkBasicAuth(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization')

  // 環境変数から認証情報を取得
  const validUser = process.env.ADMIN_BASIC_AUTH_USER
  const validPassword = process.env.ADMIN_BASIC_AUTH_PASSWORD

  // デバッグ用ログ
  console.log('[Basic Auth Debug] validUser exists:', !!validUser)
  console.log('[Basic Auth Debug] validPassword exists:', !!validPassword)
  console.log('[Basic Auth Debug] authHeader exists:', !!authHeader)

  // 環境変数が設定されていない場合はベーシック認証をスキップ
  if (!validUser || !validPassword) {
    console.warn('ベーシック認証の環境変数が設定されていません')
    return null
  }

  // Authorization ヘッダーがない場合
  if (!authHeader) {
    return new NextResponse('認証が必要です', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    })
  }

  // Basic認証のデコード（エッジランタイム対応）
  const base64Credentials = authHeader.split(' ')[1]
  const credentials = atob(base64Credentials)
  const [username, password] = credentials.split(':')

  // 認証情報の検証
  if (username !== validUser || password !== validPassword) {
    return new NextResponse('認証に失敗しました', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    })
  }

  // 認証成功
  return null
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ログインページや認証関連のパスはベーシック認証をスキップ
  const authBypassPaths = [
    '/admin/login',
    '/api/auth/',
    '/api/admin/login',
  ]

  const shouldBypassAuth = authBypassPaths.some(path =>
    pathname === path || pathname.startsWith(path)
  )

  // 管理者ルート（/admin/*）とAPIルート（/api/admin/*）にベーシック認証を適用
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
    // ログインページや認証関連パスはベーシック認証をスキップ
    if (!shouldBypassAuth) {
      const authResponse = checkBasicAuth(request)
      if (authResponse) {
        return authResponse
      }
    }

    return NextResponse.next()
  }

  // 通常のSupabaseセッション更新処理（管理者ルート以外）
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
