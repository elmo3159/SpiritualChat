import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * キャンペーン作成API
 * POST /api/admin/campaigns
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

    const supabase = createAdminClient()
    const body = await request.json()

    const {
      name,
      description,
      start_date,
      end_date,
      bonus_percentage,
      banner_image_url,
      is_active,
    } = body

    // バリデーション
    if (!name || !description || !start_date || !end_date || !bonus_percentage) {
      return NextResponse.json(
        { success: false, message: '必須項目が入力されていません' },
        { status: 400 }
      )
    }

    if (bonus_percentage <= 0 || bonus_percentage > 100) {
      return NextResponse.json(
        { success: false, message: 'ボーナス率は1〜100%の範囲で入力してください' },
        { status: 400 }
      )
    }

    if (new Date(start_date) >= new Date(end_date)) {
      return NextResponse.json(
        { success: false, message: '終了日は開始日より後の日付を指定してください' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        description,
        start_date,
        end_date,
        bonus_percentage,
        banner_image_url: banner_image_url || null,
        is_active,
      })
      .select()
      .single()

    if (error) {
      console.error('キャンペーン作成エラー:', error)
      return NextResponse.json(
        { success: false, message: 'キャンペーンの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'キャンペーンを作成しました',
      data,
    })
  } catch (error: any) {
    console.error('キャンペーン作成エラー:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
