import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * プロフィール統計API
 *
 * GET: ユーザーの統計データを取得
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未認証' }, { status: 401 })
    }

    // 鑑定回数を取得
    const { count: divinationCount } = await supabase
      .from('divination_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // 占い師ごとの鑑定回数を取得
    const { data: divinationsByFortuneTeller } = await supabase
      .from('divination_results')
      .select('fortune_teller_id, fortune_tellers(name, avatar_url)')
      .eq('user_id', user.id)

    // 占い師ごとに集計
    const fortuneTellerStats: Record<
      string,
      { name: string; avatar_url: string; count: number }
    > = {}

    divinationsByFortuneTeller?.forEach((div: any) => {
      if (!div.fortune_teller_id || !div.fortune_tellers) return

      if (!fortuneTellerStats[div.fortune_teller_id]) {
        fortuneTellerStats[div.fortune_teller_id] = {
          name: div.fortune_tellers.name,
          avatar_url: div.fortune_tellers.avatar_url,
          count: 0,
        }
      }
      fortuneTellerStats[div.fortune_teller_id].count++
    })

    // ランキング順にソート
    const fortuneTellerRanking = Object.entries(fortuneTellerStats)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // トップ5のみ

    // カテゴリ別集計（プロフィールの悩みカテゴリから）
    const { data: profile } = await supabase
      .from('profiles')
      .select('worry_category')
      .eq('id', user.id)
      .single()

    // ポイント使用統計
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('points_balance')
      .eq('user_id', user.id)
      .single()

    const { count: purchaseCount } = await supabase
      .from('points_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('transaction_type', 'purchase')

    // バッジ計算
    const badges = []
    if (divinationCount && divinationCount >= 1) {
      badges.push({
        id: 'first_divination',
        name: '初めての鑑定',
        icon: '🌟',
        description: '最初の鑑定を受けました',
      })
    }
    if (divinationCount && divinationCount >= 10) {
      badges.push({
        id: 'divination_10',
        name: '鑑定マスター',
        icon: '✨',
        description: '10回の鑑定を受けました',
      })
    }
    if (divinationCount && divinationCount >= 50) {
      badges.push({
        id: 'divination_50',
        name: '鑑定ベテラン',
        icon: '🏆',
        description: '50回の鑑定を受けました',
      })
    }
    if (purchaseCount && purchaseCount >= 1) {
      badges.push({
        id: 'first_purchase',
        name: 'サポーター',
        icon: '💎',
        description: '初めてポイントを購入しました',
      })
    }

    return NextResponse.json({
      divinationCount: divinationCount || 0,
      fortuneTellerRanking,
      worryCategory: profile?.worry_category || null,
      currentPoints: pointsData?.points_balance || 0,
      badges,
    })
  } catch (error) {
    console.error('統計取得エラー:', error)
    return NextResponse.json(
      { error: '統計の取得に失敗しました' },
      { status: 500 }
    )
  }
}
