import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * フィードバックAPI
 *
 * GET: フィードバック一覧取得
 * POST: フィードバック投稿
 */

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未認証' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let query = supabase
      .from('feedback')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data: feedbacks, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({ feedbacks: feedbacks || [] })
  } catch (error) {
    console.error('フィードバック取得エラー:', error)
    return NextResponse.json(
      { error: 'フィードバックの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未認証' }, { status: 401 })
    }

    const body = await request.json()
    const { type, title, message, npsScore } = body

    // バリデーション
    if (!type || !message) {
      return NextResponse.json(
        { error: 'タイプとメッセージは必須です' },
        { status: 400 }
      )
    }

    if (!['general', 'bug', 'feature_request', 'nps'].includes(type)) {
      return NextResponse.json(
        { error: '不正なフィードバックタイプです' },
        { status: 400 }
      )
    }

    if (type === 'nps' && (npsScore === undefined || npsScore < 0 || npsScore > 10)) {
      return NextResponse.json(
        { error: 'NPSスコアは0〜10の範囲で指定してください' },
        { status: 400 }
      )
    }

    // フィードバック登録
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        user_id: user.id,
        type,
        title: title || null,
        message,
        nps_score: type === 'nps' ? npsScore : null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ feedback: data }, { status: 201 })
  } catch (error) {
    console.error('フィードバック投稿エラー:', error)
    return NextResponse.json(
      { error: 'フィードバックの投稿に失敗しました' },
      { status: 500 }
    )
  }
}
