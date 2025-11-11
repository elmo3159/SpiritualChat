import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 管理者ルート（/admin/*）とAPIルート（/api/admin/*）はSupabaseミドルウェアをバイパス
  // 認証チェックはapp/admin/(dashboard)/layout.tsxで行う
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin/')) {
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
