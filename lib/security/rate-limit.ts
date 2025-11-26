/**
 * レート制限ユーティリティ
 *
 * サーバーレス環境（Vercel）で動作するインメモリ + フォールバック付きのレート制限
 */

import { NextRequest, NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAt: number
}

// インメモリストア（単一インスタンス内でのみ有効）
const rateLimitStore = new Map<string, RateLimitEntry>()

// デフォルトの制限設定
const DEFAULT_LIMIT = 100 // リクエスト数
const DEFAULT_WINDOW_MS = 60 * 1000 // 1分

// エンドポイント別のカスタム制限
const ENDPOINT_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login': { limit: 10, windowMs: 60 * 1000 }, // ログイン: 1分に10回
  '/api/auth/signup': { limit: 5, windowMs: 60 * 1000 }, // サインアップ: 1分に5回
  '/api/chat/send-message': { limit: 20, windowMs: 60 * 1000 }, // メッセージ送信: 1分に20回
  '/api/divination/generate': { limit: 10, windowMs: 60 * 1000 }, // 鑑定生成: 1分に10回
  '/api/contact': { limit: 3, windowMs: 60 * 1000 }, // お問い合わせ: 1分に3回
}

/**
 * クライアントIDを取得（IPアドレス + User-Agent）
 */
function getClientId(request: NextRequest): string {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  return `${ip}:${userAgent.substring(0, 50)}`
}

/**
 * 古いエントリをクリーンアップ
 */
function cleanup(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * レート制限をチェック
 *
 * @param request - Next.jsリクエスト
 * @returns レスポンス（制限に達した場合）またはnull（許可）
 */
export function checkRateLimit(request: NextRequest): NextResponse | null {
  const pathname = request.nextUrl.pathname
  const clientId = getClientId(request)
  const key = `${pathname}:${clientId}`

  // エンドポイント別の制限を取得
  const config = ENDPOINT_LIMITS[pathname] || {
    limit: DEFAULT_LIMIT,
    windowMs: DEFAULT_WINDOW_MS,
  }

  const now = Date.now()
  const entry = rateLimitStore.get(key)

  // 定期的にクリーンアップ（1%の確率）
  if (Math.random() < 0.01) {
    cleanup()
  }

  if (entry && entry.resetAt > now) {
    // ウィンドウ内
    if (entry.count >= config.limit) {
      // 制限に達した
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
      return NextResponse.json(
        {
          error: 'リクエストが多すぎます。しばらくお待ちください。',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(config.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
          },
        }
      )
    }
    // カウントを増加
    entry.count++
  } else {
    // 新しいウィンドウを開始
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + config.windowMs,
    })
  }

  return null
}

/**
 * レート制限ミドルウェア
 *
 * 特定のAPIエンドポイントにレート制限を適用
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse> | NextResponse
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = checkRateLimit(request)
    if (rateLimitResponse) {
      return rateLimitResponse
    }
    return handler(request)
  }
}
