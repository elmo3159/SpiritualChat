/**
 * 監査ログユーティリティ
 *
 * セキュリティとコンプライアンスのための監査ログ機能
 */

import { createAdminClient } from '@/lib/supabase/server'

/**
 * アクターの種類
 */
export type ActorType = 'user' | 'admin' | 'system'

/**
 * ログのステータス
 */
export type AuditStatus = 'success' | 'failure' | 'error'

/**
 * 監査ログのアクション種別
 */
export type AuditAction =
  | 'login'
  | 'logout'
  | 'signup'
  | 'password_change'
  | 'account_delete'
  | 'profile_update'
  | 'points_purchase'
  | 'points_consume'
  | 'divination_generate'
  | 'divination_unlock'
  | 'message_send'
  | 'admin_login'
  | 'admin_action'
  | 'fortune_teller_create'
  | 'fortune_teller_update'
  | 'fortune_teller_delete'
  | 'campaign_create'
  | 'campaign_update'
  | 'coupon_create'
  | 'coupon_update'
  | 'user_points_adjust'
  | 'webhook_received'

/**
 * 監査ログエントリ
 */
export interface AuditLogEntry {
  actorType: ActorType
  actorId?: string
  actorEmail?: string
  action: AuditAction
  resourceType?: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  status: AuditStatus
  errorMessage?: string
}

/**
 * 監査ログを記録
 *
 * @param entry - 監査ログエントリ
 * @returns 成功した場合true
 */
export async function logAudit(entry: AuditLogEntry): Promise<boolean> {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from('audit_logs').insert({
      actor_type: entry.actorType,
      actor_id: entry.actorId || null,
      actor_email: entry.actorEmail || null,
      action: entry.action,
      resource_type: entry.resourceType || null,
      resource_id: entry.resourceId || null,
      details: entry.details || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      status: entry.status,
      error_message: entry.errorMessage || null,
    })

    if (error) {
      console.error('[Audit] ログ記録エラー:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('[Audit] 予期しないエラー:', error)
    return false
  }
}

/**
 * ユーザーアクションをログ
 */
export async function logUserAction(
  userId: string,
  userEmail: string | undefined,
  action: AuditAction,
  options?: {
    resourceType?: string
    resourceId?: string
    details?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    status?: AuditStatus
    errorMessage?: string
  }
): Promise<boolean> {
  return logAudit({
    actorType: 'user',
    actorId: userId,
    actorEmail: userEmail,
    action,
    resourceType: options?.resourceType,
    resourceId: options?.resourceId,
    details: options?.details,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    status: options?.status || 'success',
    errorMessage: options?.errorMessage,
  })
}

/**
 * 管理者アクションをログ
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: AuditAction,
  options?: {
    resourceType?: string
    resourceId?: string
    details?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    status?: AuditStatus
    errorMessage?: string
  }
): Promise<boolean> {
  return logAudit({
    actorType: 'admin',
    actorId: adminId,
    actorEmail: adminEmail,
    action,
    resourceType: options?.resourceType,
    resourceId: options?.resourceId,
    details: options?.details,
    ipAddress: options?.ipAddress,
    userAgent: options?.userAgent,
    status: options?.status || 'success',
    errorMessage: options?.errorMessage,
  })
}

/**
 * システムアクションをログ
 */
export async function logSystemAction(
  action: AuditAction,
  options?: {
    resourceType?: string
    resourceId?: string
    details?: Record<string, unknown>
    status?: AuditStatus
    errorMessage?: string
  }
): Promise<boolean> {
  return logAudit({
    actorType: 'system',
    action,
    resourceType: options?.resourceType,
    resourceId: options?.resourceId,
    details: options?.details,
    status: options?.status || 'success',
    errorMessage: options?.errorMessage,
  })
}
