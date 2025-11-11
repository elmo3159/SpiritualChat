import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * 管理者セットアップAPI（開発用）
 *
 * このエンドポイントは本番環境では削除する必要があります
 */
export async function POST(request: NextRequest) {
  try {
    // セキュリティ：本番環境では無効化
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'This endpoint is disabled in production' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // テスト管理者アカウントのデータ
    const adminData = {
      email: 'admin@example.com',
      name: 'System Administrator',
      password_hash: '$2a$10$Ma8GXqWk9Im2135hQebcquto2zTuquEU2VteBHjdnba6Bg1v/xxLC',
      role: 'superadmin',
      is_active: true,
    }

    // データを挿入（既存の場合は更新）
    const { data, error } = await supabase
      .from('admin_users')
      .upsert(adminData, { onConflict: 'email' })
      .select()

    if (error) {
      console.error('[SETUP] Error inserting admin:', error)
      return NextResponse.json(
        { success: false, message: error.message, error },
        { status: 500 }
      )
    }

    console.log('[SETUP] Admin user created successfully:', data)

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        email: adminData.email,
        password: 'admin123',
      },
    })
  } catch (error) {
    console.error('[SETUP] Unexpected error:', error)
    return NextResponse.json(
      { success: false, message: 'Setup failed', error: String(error) },
      { status: 500 }
    )
  }
}
