import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * ログアウトAPI
 *
 * POST /api/auth/logout
 *
 * ユーザーをログアウトします
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // サインアウト
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('ログアウトエラー:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'ログアウトに失敗しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    })
  } catch (error) {
    console.error('ログアウトエラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'ログアウトに失敗しました',
      },
      { status: 500 }
    )
  }
}
