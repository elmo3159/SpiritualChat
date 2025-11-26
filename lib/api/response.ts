/**
 * 統一APIレスポンスユーティリティ
 *
 * 全APIで一貫したレスポンス形式を提供
 */

import { NextResponse } from 'next/server'

/**
 * 標準APIレスポンス形式
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string
    message: string
  }
  meta?: {
    timestamp: string
    requestId?: string
    [key: string]: unknown
  }
}

/**
 * エラーコード定義
 */
export const ErrorCodes = {
  // 認証・認可
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // バリデーション
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // リソース
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // ビジネスロジック
  INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',

  // サーバー
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * 成功レスポンスを生成
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  if (data !== undefined) {
    response.data = data
  }

  if (message) {
    response.message = message
  }

  return NextResponse.json(response, { status })
}

/**
 * エラーレスポンスを生成
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number = 500
): NextResponse<ApiResponse<never>> {
  const response: ApiResponse<never> = {
    success: false,
    error: {
      code,
      message,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  }

  return NextResponse.json(response, { status })
}

/**
 * 認証エラーレスポンス
 */
export function unauthorizedResponse(
  message: string = '認証が必要です'
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.UNAUTHORIZED, message, 401)
}

/**
 * 権限エラーレスポンス
 */
export function forbiddenResponse(
  message: string = 'アクセスが拒否されました'
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.FORBIDDEN, message, 403)
}

/**
 * Not Foundレスポンス
 */
export function notFoundResponse(
  message: string = 'リソースが見つかりません'
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.NOT_FOUND, message, 404)
}

/**
 * バリデーションエラーレスポンス
 */
export function validationErrorResponse(
  message: string = '入力内容に誤りがあります'
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.VALIDATION_ERROR, message, 400)
}

/**
 * レート制限エラーレスポンス
 */
export function rateLimitResponse(
  retryAfter?: number
): NextResponse<ApiResponse<never>> {
  const response = errorResponse(
    ErrorCodes.RATE_LIMIT_EXCEEDED,
    'リクエストが多すぎます。しばらくお待ちください。',
    429
  )

  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter))
  }

  return response
}

/**
 * 内部エラーレスポンス
 */
export function internalErrorResponse(
  message: string = 'サーバーエラーが発生しました'
): NextResponse<ApiResponse<never>> {
  return errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500)
}
