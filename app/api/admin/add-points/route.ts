import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * 管理者用ポイント追加API（テスト用）
 *
 * POST /api/admin/add-points
 *
 * 開発・テスト環境でのみ使用する管理者用エンドポイント
 */
export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json(
        { success: false, message: '管理者認証が必要です' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'ユーザー認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディを取得
    const body = await request.json()
    const { amount = 5000 } = body // デフォルトで5000ポイント追加

    // user_pointsテーブルにレコードが存在するか確認
    const { data: existingPoints, error: fetchError } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116は「レコードが見つからない」エラー
      console.error('ポイント取得エラー:', fetchError)
      return NextResponse.json(
        { success: false, message: 'ポイント情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    let newBalance = amount

    if (existingPoints) {
      // 既存のレコードがある場合は更新
      newBalance = existingPoints.points_balance + amount

      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          points_balance: newBalance,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('ポイント更新エラー:', updateError)
        return NextResponse.json(
          { success: false, message: 'ポイントの更新に失敗しました' },
          { status: 500 }
        )
      }
    } else {
      // レコードがない場合は新規作成
      const { error: insertError } = await supabase
        .from('user_points')
        .insert({
          user_id: user.id,
          points_balance: amount,
        })

      if (insertError) {
        console.error('ポイント作成エラー:', insertError)
        return NextResponse.json(
          { success: false, message: 'ポイントの作成に失敗しました' },
          { status: 500 }
        )
      }
    }

    // points_transactionsテーブルに履歴を記録
    const { error: transactionError } = await supabase
      .from('points_transactions')
      .insert({
        user_id: user.id,
        amount: amount,
        transaction_type: 'purchase',
        description: `管理者によるポイント追加（テスト用）`,
      })

    if (transactionError) {
      console.error('取引履歴記録エラー:', transactionError)
      // 履歴の記録に失敗してもポイント追加は成功とする
    }

    return NextResponse.json({
      success: true,
      message: `${amount}ポイントを追加しました`,
      data: {
        addedAmount: amount,
        newBalance: newBalance,
      },
    })
  } catch (error) {
    console.error('ポイント追加エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'ポイントの追加に失敗しました',
      },
      { status: 500 }
    )
  }
}
