import { createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()
    const { fortuneTellerId, direction } = await request.json()

    // 現在の占い師データを取得
    const { data: currentFortuneTeller, error: fetchError } = await supabase
      .from('fortune_tellers')
      .select('display_order')
      .eq('id', fortuneTellerId)
      .single()

    if (fetchError || !currentFortuneTeller) {
      return NextResponse.json({ error: '占い師が見つかりません' }, { status: 404 })
    }

    const currentOrder = currentFortuneTeller.display_order

    // 入れ替える占い師を取得
    const { data: swapTarget } = await supabase
      .from('fortune_tellers')
      .select('id, display_order')
      .eq('display_order', direction === 'up' ? currentOrder - 1 : currentOrder + 1)
      .single()

    if (!swapTarget) {
      return NextResponse.json({ error: 'これ以上移動できません' }, { status: 400 })
    }

    // 順序を入れ替え
    const { error: updateError1 } = await supabase
      .from('fortune_tellers')
      .update({ display_order: swapTarget.display_order })
      .eq('id', fortuneTellerId)

    const { error: updateError2 } = await supabase
      .from('fortune_tellers')
      .update({ display_order: currentOrder })
      .eq('id', swapTarget.id)

    if (updateError1 || updateError2) {
      return NextResponse.json({ error: '並び替えに失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('並び替えエラー:', error)
    return NextResponse.json({ error: '並び替えに失敗しました' }, { status: 500 })
  }
}
