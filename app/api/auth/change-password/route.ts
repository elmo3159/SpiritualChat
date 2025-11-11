import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * パスワード変更API
 *
 * POST /api/auth/change-password
 *
 * ユーザーのパスワードを変更します
 */
export async function POST(request: NextRequest) {
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

    // リクエストボディを取得
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: '現在のパスワードと新しいパスワードが必要です',
        },
        { status: 400 }
      )
    }

    // 新しいパスワードのバリデーション
    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: '新しいパスワードは6文字以上である必要があります',
        },
        { status: 400 }
      )
    }

    // 現在のパスワードを検証
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError) {
      return NextResponse.json(
        {
          success: false,
          message: '現在のパスワードが正しくありません',
        },
        { status: 400 }
      )
    }

    // パスワードを更新
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      console.error('パスワード更新エラー:', updateError)
      return NextResponse.json(
        {
          success: false,
          message: 'パスワードの更新に失敗しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'パスワードを変更しました',
    })
  } catch (error: any) {
    console.error('パスワード変更エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'パスワードの変更に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
