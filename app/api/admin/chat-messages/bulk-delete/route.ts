import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * チャットメッセージ一括削除API (管理者用)
 *
 * POST /api/admin/chat-messages/bulk-delete
 * Body: { messageIds: string[], divinationIds: string[] }
 */
export async function POST(request: NextRequest) {
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
    const { messageIds = [], divinationIds = [] } = await request.json()

    if (!Array.isArray(messageIds) || !Array.isArray(divinationIds)) {
      return NextResponse.json(
        { success: false, message: '不正なリクエスト形式です' },
        { status: 400 }
      )
    }

    if (messageIds.length === 0 && divinationIds.length === 0) {
      return NextResponse.json(
        { success: false, message: '削除対象が選択されていません' },
        { status: 400 }
      )
    }

    let deletedCount = 0
    let errors = []

    // チャットメッセージを一括削除
    if (messageIds.length > 0) {
      const { error: messageError, count } = await supabase
        .from('chat_messages')
        .delete({ count: 'exact' })
        .in('id', messageIds)

      if (messageError) {
        console.error('メッセージ一括削除エラー:', messageError)
        errors.push('一部のメッセージの削除に失敗しました')
      } else {
        deletedCount += count || 0
      }
    }

    // 鑑定結果を一括削除
    if (divinationIds.length > 0) {
      const { error: divinationError, count } = await supabase
        .from('divination_results')
        .delete({ count: 'exact' })
        .in('id', divinationIds)

      if (divinationError) {
        console.error('鑑定結果一括削除エラー:', divinationError)
        errors.push('一部の鑑定結果の削除に失敗しました')
      } else {
        deletedCount += count || 0
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: errors.join(', '),
          deletedCount,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount}件のアイテムを削除しました`,
      deletedCount,
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { success: false, message: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
