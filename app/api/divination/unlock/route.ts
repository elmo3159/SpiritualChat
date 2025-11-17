import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UnlockDivinationResponse } from '@/lib/types/divination'
import { resetMessageLimit } from '@/lib/supabase/message-limits'
import { updateLevelOnPointsUsed } from '@/lib/services/level-service'

/**
 * 鑑定結果開封API
 *
 * POST /api/divination/unlock
 *
 * ポイントを消費して鑑定結果の全文を開封します
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
    const { divinationId } = body

    if (!divinationId) {
      return NextResponse.json(
        { success: false, message: '鑑定結果IDが必要です' },
        { status: 400 }
      )
    }

    // 鑑定結果を取得
    const { data: divination, error: divinationError } = await supabase
      .from('divination_results')
      .select('*')
      .eq('id', divinationId)
      .eq('user_id', user.id) // ユーザー所有確認
      .single()

    if (divinationError || !divination) {
      return NextResponse.json(
        { success: false, message: '鑑定結果が見つかりません' },
        { status: 404 }
      )
    }

    // 既に開封済みかチェック
    if (divination.is_unlocked) {
      return NextResponse.json({
        success: true,
        message: 'この鑑定結果は既に開封済みです',
        data: {
          resultFull: divination.result_encrypted,
          pointsConsumed: divination.points_consumed || 0,
          newBalance: 0, // 既に開封済みなので残高は変わらない
        },
      })
    }

    // ポイント消費（consume_points関数を呼び出し）
    const UNLOCK_COST = 1000 // 開封コスト

    const { data: consumeResult, error: consumeError } = await supabase.rpc(
      'consume_points',
      {
        p_user_id: user.id,
        p_amount: UNLOCK_COST,
        p_reference_type: 'divination_result',
        p_reference_id: divinationId,
        p_description: '鑑定結果の開封',
      }
    )

    if (consumeError) {
      console.error('ポイント消費エラー:', consumeError)
      return NextResponse.json(
        { success: false, message: 'ポイント消費に失敗しました' },
        { status: 500 }
      )
    }

    // consume_points関数の返り値を確認
    if (!consumeResult || !consumeResult.success) {
      const errorMessage =
        consumeResult?.error === 'insufficient_points'
          ? 'ポイントが不足しています'
          : 'ポイント消費に失敗しました'

      return NextResponse.json(
        { success: false, message: errorMessage },
        { status: 400 }
      )
    }

    // ポイント消費成功 → 経験値とレベルを更新
    await updateLevelOnPointsUsed(user.id, UNLOCK_COST)

    // 鑑定結果を開封済みに更新
    const { error: updateError } = await supabase
      .from('divination_results')
      .update({
        is_unlocked: true,
        points_consumed: UNLOCK_COST,
        unlocked_at: new Date().toISOString(),
      })
      .eq('id', divinationId)
      .eq('user_id', user.id) // セキュリティのため再確認

    if (updateError) {
      console.error('鑑定結果更新エラー:', updateError)
      return NextResponse.json(
        { success: false, message: '鑑定結果の更新に失敗しました' },
        { status: 500 }
      )
    }

    // メッセージ送信回数制限をリセット
    await resetMessageLimit(supabase, user.id, divination.fortune_teller_id)

    // 注: 次の鑑定提案は1分後にクライアント側から /api/chat/post-unlock-suggestion を呼び出して生成されます

    // レスポンスを返却
    const response: UnlockDivinationResponse = {
      success: true,
      data: {
        resultFull: divination.result_encrypted,
        pointsConsumed: UNLOCK_COST,
        newBalance: consumeResult.new_balance,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('鑑定結果開封エラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: '鑑定結果の開封に失敗しました',
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
