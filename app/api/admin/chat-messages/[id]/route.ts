import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * チャットメッセージ編集API (管理者用)
 *
 * PUT /api/admin/chat-messages/[id]
 */
export async function PUT(
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
    const { content } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'メッセージ内容が空です' },
        { status: 400 }
      )
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { success: false, message: 'メッセージは1000文字以内で入力してください' },
        { status: 400 }
      )
    }

    // メッセージを更新
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content: content.trim() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('メッセージ更新エラー:', error)
      return NextResponse.json(
        { success: false, message: 'メッセージの更新に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { success: false, message: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * チャットメッセージ削除API (管理者用)
 *
 * DELETE /api/admin/chat-messages/[id]
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

    // メッセージを削除
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('メッセージ削除エラー:', error)
      return NextResponse.json(
        { success: false, message: 'メッセージの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'メッセージを削除しました',
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { success: false, message: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
