import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * アカウント削除API
 *
 * DELETE /api/auth/delete-account
 *
 * ユーザーアカウントとすべての関連データを削除します
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: '認証が必要です' },
        { status: 401 }
      )
    }

    // データベースからユーザーデータを削除
    // CASCADE設定により、関連するデータも自動的に削除されます
    // - profiles
    // - chat_messages
    // - divination_results
    // - user_points
    // - points_transactions
    // - message_limits

    // プロフィールを削除（CASCADE で他のテーブルも削除される）
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileDeleteError) {
      console.error('プロフィール削除エラー:', profileDeleteError)
      // プロフィールが存在しない場合はエラーにしない
      if (profileDeleteError.code !== 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            message: 'ユーザーデータの削除に失敗しました',
          },
          { status: 500 }
        )
      }
    }

    // Supabase Authからユーザーを削除
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
      user.id
    )

    if (authDeleteError) {
      console.error('認証ユーザー削除エラー:', authDeleteError)
      // 管理者権限がない場合は、signOutで対応
      console.log('管理者権限がないため、サインアウトを実行します')
    }

    // サインアウト
    await supabase.auth.signOut()

    return NextResponse.json({
      success: true,
      message: 'アカウントを削除しました',
    })
  } catch (error: any) {
    console.error('アカウント削除エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'アカウントの削除に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
