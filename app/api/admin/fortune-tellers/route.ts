import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * 占い師管理API
 *
 * POST /api/admin/fortune-tellers - 占い師を新規作成
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

    // 占い師を作成
    const { data, error } = await supabase
      .from('fortune_tellers')
      .insert([
        {
          name,
          title,
          description,
          specialties,
          suggestion_prompt,
          re_suggestion_prompt,
          divination_prompt,
          system_prompt: suggestion_prompt, // 提案生成用プロンプトをシステムプロンプトとしても使用
          greeting_message: `こんにちは、${name}です。${description}`, // 挨拶メッセージを自動生成
          is_active: is_active ?? true,
          avatar_url: avatar_url || null,
        },
      ])
      .select()

    if (error) {
      console.error('Error creating fortune teller:', error)
      return NextResponse.json(
        {
          success: false,
          message: '占い師の作成に失敗しました',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data[0],
    })
  } catch (error) {
    console.error('Fortune teller creation error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '占い師作成処理中にエラーが発生しました',
      },
      { status: 500 }
    )
  }
}
