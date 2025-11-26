import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

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

    const userId = user.id

    // データベースからユーザーデータを削除
    // CASCADE設定により、関連するデータも自動的に削除されます
    // - profiles
    // - chat_messages
    // - divination_results
    // - user_points
    // - points_transactions
    // - message_limits
    // - user_levels

    // プロフィールを削除（CASCADE で他のテーブルも削除される）
    const { error: profileDeleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

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

    // サインアウト（auth.usersからの削除前に実行）
    await supabase.auth.signOut()

    // Service Role Keyを使用した管理者クライアントでauth.usersから削除
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    )

    if (authDeleteError) {
      console.error('認証ユーザー削除エラー:', authDeleteError)
      return NextResponse.json(
        {
          success: false,
          message: 'アカウントの完全な削除に失敗しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'アカウントを完全に削除しました',
    })
  } catch (error) {
    console.error('アカウント削除エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'アカウントの削除に失敗しました',
      },
      { status: 500 }
    )
  }
}
