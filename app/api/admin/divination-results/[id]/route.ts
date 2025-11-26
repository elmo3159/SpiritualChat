import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * 鑑定結果削除API (管理者用)
 *
 * DELETE /api/admin/divination-results/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 鑑定結果を削除
    const { error } = await supabase
      .from('divination_results')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('鑑定結果削除エラー:', error)
      return NextResponse.json(
        { success: false, message: '鑑定結果の削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '鑑定結果を削除しました',
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { success: false, message: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
