import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * 初回購入判定API
 * ユーザーが過去にポイントを購入したことがあるかどうかを判定
 */
export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isFirstPurchase: true })
    }

    // 購入履歴を確認
    const { count, error } = await supabase
      .from('points_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('transaction_type', 'purchase')

    if (error) {
      console.error('購入履歴確認エラー:', error)
      // エラー時は初回として扱う（機会損失を防ぐ）
      return NextResponse.json({ isFirstPurchase: true })
    }

    return NextResponse.json({
      isFirstPurchase: (count ?? 0) === 0,
    })
  } catch (error) {
    console.error('初回購入判定エラー:', error)
    return NextResponse.json({ isFirstPurchase: true })
  }
}
