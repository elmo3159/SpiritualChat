import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * GET /api/favorites
 * ユーザーのお気に入り占い師一覧を取得
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // お気に入り占い師IDを取得
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorite_fortune_tellers')
      .select('fortune_teller_id')
      .eq('user_id', user.id)

    if (favoritesError) {
      console.error('お気に入り取得エラー:', favoritesError)
      return NextResponse.json(
        { error: 'お気に入りの取得に失敗しました' },
        { status: 500 }
      )
    }

    const fortuneTellerIds = favorites.map((fav) => fav.fortune_teller_id)

    return NextResponse.json({
      favoriteIds: fortuneTellerIds,
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/favorites
 * お気に入りに占い師を追加
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディから占い師IDを取得
    const { fortuneTellerId } = await request.json()

    if (!fortuneTellerId) {
      return NextResponse.json(
        { error: '占い師IDが必要です' },
        { status: 400 }
      )
    }

    // お気に入りに追加
    const { error: insertError } = await supabase
      .from('favorite_fortune_tellers')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
      })

    if (insertError) {
      // 既にお気に入りに追加されている場合はエラーにならないようにする
      if (insertError.code === '23505') {
        // UNIQUE制約違反
        return NextResponse.json({
          success: true,
          message: '既にお気に入りに追加されています',
        })
      }

      console.error('お気に入り追加エラー:', insertError)
      return NextResponse.json(
        { error: 'お気に入りの追加に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'お気に入りに追加しました',
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/favorites
 * お気に入りから占い師を削除
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // ユーザー認証チェック
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      )
    }

    // リクエストボディから占い師IDを取得
    const { fortuneTellerId } = await request.json()

    if (!fortuneTellerId) {
      return NextResponse.json(
        { error: '占い師IDが必要です' },
        { status: 400 }
      )
    }

    // お気に入りから削除
    const { error: deleteError } = await supabase
      .from('favorite_fortune_tellers')
      .delete()
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)

    if (deleteError) {
      console.error('お気に入り削除エラー:', deleteError)
      return NextResponse.json(
        { error: 'お気に入りの削除に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'お気に入りから削除しました',
    })
  } catch (error) {
    console.error('予期しないエラー:', error)
    return NextResponse.json(
      { error: '予期しないエラーが発生しました' },
      { status: 500 }
    )
  }
}
