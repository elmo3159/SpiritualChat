import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()

    const { data: fortunes, error } = await supabase
      .from('daily_fortunes')
      .select('*')
      .eq('user_id', params.userId)
      .order('fortune_date', { ascending: false })

    if (error) {
      console.error('運勢データ取得エラー:', error)
      return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json(fortunes || [])
  } catch (error) {
    console.error('運勢データ取得エラー:', error)
    return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 })
  }
}
