import { NextRequest, NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth/admin'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * 設定一覧を取得
 */
export async function GET(request: NextRequest) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 全設定を取得
    const { data: settings, error } = await supabase
      .from('app_settings')
      .select('*')
      .order('key')

    if (error) {
      console.error('設定取得エラー:', error)
      return NextResponse.json(
        { error: '設定の取得に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ settings })
  } catch (error: any) {
    console.error('GET /api/admin/settings エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * 設定を更新
 */
export async function PATCH(request: NextRequest) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { key, value } = body

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'keyとvalueは必須です' },
        { status: 400 }
      )
    }

    // 設定を更新（存在しない場合は作成）
    const { data, error } = await supabase
      .from('app_settings')
      .upsert(
        {
          key,
          value: String(value),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'key',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('設定更新エラー:', error)
      return NextResponse.json(
        { error: '設定の更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({ setting: data })
  } catch (error: any) {
    console.error('PATCH /api/admin/settings エラー:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
