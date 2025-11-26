/**
 * 構造化ログユーティリティ
 *
 * JSON形式のログ出力でログ集約サービス（Datadog, Vercel Logs等）との統合が容易
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

/**
 * ログレベルの優先度
 */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

/**
 * 現在のログレベル（環境変数で制御可能）
 */
const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

/**
 * ログエントリをフォーマット
 */
function formatLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return entry
}

/**
 * ログを出力
 */
function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  // ログレベルフィルタリング
  if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[CURRENT_LOG_LEVEL]) {
    return
  }

  const entry = formatLogEntry(level, message, context, error)

  // 本番環境ではJSON形式、開発環境では読みやすい形式
  if (process.env.NODE_ENV === 'production') {
    const output = JSON.stringify(entry)
    switch (level) {
      case 'debug':
      case 'info':
        console.log(output)
        break
      case 'warn':
        console.warn(output)
        break
      case 'error':
        console.error(output)
        break
    }
  } else {
    // 開発環境では読みやすい形式
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
    const contextStr = context ? ` ${JSON.stringify(context)}` : ''

    switch (level) {
      case 'debug':
        console.debug(`${prefix} ${message}${contextStr}`)
        break
      case 'info':
        console.info(`${prefix} ${message}${contextStr}`)
        break
      case 'warn':
        console.warn(`${prefix} ${message}${contextStr}`)
        break
      case 'error':
        console.error(`${prefix} ${message}${contextStr}`)
        if (error) {
          console.error(error)
        }
        break
    }
  }
}

/**
 * Logger クラス - 名前空間付きログ
 */
export class Logger {
  private namespace: string

  constructor(namespace: string) {
    this.namespace = namespace
  }

  private addNamespace(context?: LogContext): LogContext {
    return {
      namespace: this.namespace,
      ...context,
    }
  }

  debug(message: string, context?: LogContext): void {
    log('debug', message, this.addNamespace(context))
  }

  info(message: string, context?: LogContext): void {
    log('info', message, this.addNamespace(context))
  }

  warn(message: string, context?: LogContext): void {
    log('warn', message, this.addNamespace(context))
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const err = error instanceof Error ? error : undefined
    log('error', message, this.addNamespace(context), err)
  }
}

/**
 * 名前空間付きロガーを作成
 */
export function createLogger(namespace: string): Logger {
  return new Logger(namespace)
}

// グローバルロガー（名前空間なし）
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const err = error instanceof Error ? error : undefined
    log('error', message, context, err)
  },
}
