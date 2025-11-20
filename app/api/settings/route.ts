import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * パブリック設定を取得
 *
 * 認証不要で取得可能な設定のみを返す
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // enable_test_plan設定のみを取得
    const { data, error } = await supabase
      .from('app_settings')
      .select('key, value')
      .eq('key', 'enable_test_plan')
      .single()

    if (error) {
      console.error('設定取得エラー:', error)
      // デフォルト値を返す
      return NextResponse.json({
        enable_test_plan: true,
      })
    }

    return NextResponse.json({
      enable_test_plan: data.value === 'true',
    })
  } catch (error: any) {
    console.error('GET /api/settings エラー:', error)
    // エラー時もデフォルト値を返す
    return NextResponse.json({
      enable_test_plan: true,
    })
  }
}
