import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { resetMessageLimit } from '@/lib/supabase/message-limits'

/**
 * メッセージ送信制限リセットAPI（管理者用）
 *
 * POST /api/admin/users/[userId]/reset-message-limits
 * Body: { fortuneTellerId?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = createAdminClient()
    const { fortuneTellerId } = await request.json()

    if (!fortuneTellerId) {
      // 占い師IDが指定されていない場合は、全占い師との制限をリセット
      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('message_limits')
        .delete()
        .eq('user_id', params.userId)
        .eq('target_date', today)

      if (error) {
        console.error('全メッセージ制限リセットエラー:', error)
        return NextResponse.json(
          { success: false, message: 'メッセージ制限のリセットに失敗しました' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: '全占い師とのメッセージ制限をリセットしました',
      })
    }

    // 特定の占い師とのメッセージ制限をリセット
    const resetSuccess = await resetMessageLimit(
      supabase,
      params.userId,
      fortuneTellerId
    )

    if (!resetSuccess) {
      return NextResponse.json(
        { success: false, message: 'メッセージ制限のリセットに失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'メッセージ制限をリセットしました',
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { success: false, message: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
