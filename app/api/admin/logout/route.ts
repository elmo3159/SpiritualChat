import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * 管理者ログアウトAPI
 *
 * POST /api/admin/logout
 */
export async function POST(request: NextRequest) {
  try {
    // Cookieからトークンを削除
    const cookieStore = await cookies()
    cookieStore.delete('admin_token')

    return NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    })
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'ログアウト処理中にエラーが発生しました',
      },
      { status: 500 }
    )
  }
}
