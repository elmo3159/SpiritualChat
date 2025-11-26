import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimit } from '@/lib/security/rate-limit'

/**
 * レート制限対象のAPIパス
 */
const RATE_LIMITED_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/chat/send-message',
  '/api/divination/generate',
  '/api/contact',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // レート制限チェック（対象のAPIパスのみ）
  if (RATE_LIMITED_PATHS.some(path => pathname.startsWith(path))) {
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
  }

  // ログインページや認証関連のパスはベーシック認証をスキップ
  const authBypassPaths = [
    '/admin/login',
    '/api/auth/',
    '/api/admin/login',
  ]

  const shouldBypassAuth = authBypassPaths.some(path =>
    pathname === path || pathname.startsWith(path)
  )

  // 管理者ルート（/admin/*）とAPIルート（/api/admin/*）
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
    if (!shouldBypassAuth) {
      // 将来的なセキュリティチェックをここに追加可能
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
