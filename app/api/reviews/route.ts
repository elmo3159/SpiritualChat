import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const fortuneTellerId = searchParams.get('fortuneTellerId')

    if (!fortuneTellerId) {
      return NextResponse.json({ error: '占い師IDが必要です' }, { status: 400 })
    }

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, profiles(nickname)')
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('レビュー取得エラー:', error)
      return NextResponse.json({ error: 'レビューの取得に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ reviews: reviews || [] })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json({ error: '予期しないエラーが発生しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { fortuneTellerId, rating, comment } = await request.json()

    if (!fortuneTellerId || !rating) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: '評価は1から5の間で指定してください' }, { status: 400 })
    }

    const { error: insertError } = await supabase.from('reviews').insert({
      user_id: user.id,
      fortune_teller_id: fortuneTellerId,
      rating,
      comment,
    })

    if (insertError) {
      console.error('レビュー投稿エラー:', insertError)
      return NextResponse.json({ error: 'レビューの投稿に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'レビューを投稿しました' })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json({ error: '予期しないエラーが発生しました' }, { status: 500 })
  }
}
