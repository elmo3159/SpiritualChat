import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * 占い師更新/削除API
 *
 * PUT /api/admin/fortune-tellers/[id] - 占い師を更新
 * DELETE /api/admin/fortune-tellers/[id] - 占い師を削除
 */

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { name, title, description, specialties, suggestion_prompt, re_suggestion_prompt, divination_prompt, is_active, avatar_url } = body

    // バリデーション
    if (!name || !title || !description || !specialties || !suggestion_prompt || !re_suggestion_prompt || !divination_prompt) {
      return NextResponse.json(
        {
          success: false,
          message: 'すべての必須項目を入力してください',
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(specialties) || specialties.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: '特技/専門分野は少なくとも1つ必要です',
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 占い師を更新
    const { data, error } = await supabase
      .from('fortune_tellers')
      .update({
        name,
        title,
        description,
        specialties,
        suggestion_prompt,
        re_suggestion_prompt,
        divination_prompt,
        is_active: is_active ?? true,
        avatar_url: avatar_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()

    if (error) {
      console.error('Error updating fortune teller:', error)
      return NextResponse.json(
        {
          success: false,
          message: '占い師の更新に失敗しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    })
  } catch (error) {
    console.error('Fortune teller update error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '占い師更新処理中にエラーが発生しました',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // 占い師を削除
    const { error } = await supabase
      .from('fortune_tellers')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting fortune teller:', error)
      return NextResponse.json(
        {
          success: false,
          message: '占い師の削除に失敗しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '占い師を削除しました',
    })
  } catch (error) {
    console.error('Fortune teller deletion error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '占い師削除処理中にエラーが発生しました',
      },
      { status: 500 }
    )
  }
}
