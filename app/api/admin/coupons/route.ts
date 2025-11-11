import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * 繧ｯ繝ｼ繝昴Φ菴懈・API
 * POST /api/admin/coupons
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()

    const {
      code,
      discount_type,
      discount_value,
      valid_from,
      valid_until,
      max_uses,
      max_uses_per_user,
      target_users,
      specific_user_ids,
      is_active,
    } = body

    // 繝舌Μ繝・・繧ｷ繝ｧ繝ｳ
    if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
      return NextResponse.json(
        { success: false, message: '蠢・磯・岼縺悟・蜉帙＆繧後※縺・∪縺帙ｓ' },
        { status: 400 }
      )
    }

    // 繧ｳ繝ｼ繝峨・驥崎､・メ繧ｧ繝・け
    const { data: existingCoupon } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code)
      .single()

    if (existingCoupon) {
      return NextResponse.json(
        { success: false, message: '縺薙・繧ｯ繝ｼ繝昴Φ繧ｳ繝ｼ繝峨・譌｢縺ｫ菴ｿ逕ｨ縺輔ｌ縺ｦ縺・∪縺・ },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code,
        discount_type,
        discount_value,
        valid_from,
        valid_until,
        max_uses: max_uses || null,
        max_uses_per_user,
        target_users,
        specific_user_ids: specific_user_ids || null,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('繧ｯ繝ｼ繝昴Φ菴懈・繧ｨ繝ｩ繝ｼ:', error)
      return NextResponse.json(
        { success: false, message: '繧ｯ繝ｼ繝昴Φ縺ｮ菴懈・縺ｫ螟ｱ謨励＠縺ｾ縺励◆' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '繧ｯ繝ｼ繝昴Φ繧剃ｽ懈・縺励∪縺励◆',
      data,
    })
  } catch (error: any) {
    console.error('繧ｯ繝ｼ繝昴Φ菴懈・繧ｨ繝ｩ繝ｼ:', error)
    return NextResponse.json(
      { success: false, message: '繧ｵ繝ｼ繝舌・繧ｨ繝ｩ繝ｼ縺檎匱逕溘＠縺ｾ縺励◆' },
      { status: 500 }
    )
  }
}
