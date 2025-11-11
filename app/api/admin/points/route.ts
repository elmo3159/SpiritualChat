import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * ポイント管理API
 *
 * POST /api/admin/points
 * ユーザーのポイント残高を追加・減算
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

    const body = await request.json()
    const { userId, amount } = body

    // バリデーション
    if (!userId || typeof amount !== 'number') {
      return NextResponse.json(
        {
          success: false,
          message: 'ユーザーIDとポイント数を正しく指定してください',
        },
        { status: 400 }
      )
    }

    if (amount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ポイント数は0以外の値を指定してください',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 現在のポイント残高を取得
    const { data: currentPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('points_balance')
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching current points:', fetchError)
      return NextResponse.json(
        {
          success: false,
          message: 'ポイント残高の取得に失敗しました',
        },
        { status: 500 }
      )
    }

    const newPoints = currentPoints.points_balance + amount

    // 負の値にならないようチェック
    if (newPoints < 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'ポイント残高が不足しています',
        },
        { status: 400 }
      )
    }

    // ポイント更新
    const { error: updateError } = await supabase
      .from('user_points')
      .update({
        points_balance: newPoints,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (updateError) {
      console.error('Error updating points:', updateError)
      return NextResponse.json(
        {
          success: false,
          message: 'ポイント更新に失敗しました',
        },
        { status: 500 }
      )
    }

    // ポイント履歴を記録（今後の実装用）
    // TODO: point_transactions テーブルに履歴を記録

    return NextResponse.json({
      success: true,
      data: {
        userId,
        previousPoints: currentPoints.points_balance,
        amount,
        newPoints,
      },
    })
  } catch (error) {
    console.error('Point management error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'ポイント管理処理中にエラーが発生しました',
      },
      { status: 500 }
    )
  }
}
