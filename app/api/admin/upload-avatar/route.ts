import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentAdmin } from '@/lib/auth/admin'

/**
 * 占い師アバター画像アップロードAPI
 *
 * POST: 画像をStorageにアップロード
 */
export async function POST(request: NextRequest) {
  try {
    // 管理者認証チェック
    const admin = await getCurrentAdmin()
    console.log('Admin check result:', admin)

    if (!admin) {
      console.log('Admin authentication failed')
      return NextResponse.json(
        { success: false, message: '認証が必要です。管理者ページから再ログインしてください。' },
        { status: 401 }
      )
    }

    console.log('Admin authenticated:', admin.email)
    const supabase = createAdminClient()

    // フォームデータを取得
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'ファイルが指定されていません' },
        { status: 400 }
      )
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'ファイルサイズは5MB以下にしてください' },
        { status: 400 }
      )
    }

    // ファイルタイプチェック
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: '対応していないファイル形式です。JPEG、PNG、WebP、GIFのみアップロード可能です',
        },
        { status: 400 }
      )
    }

    // ファイル名を生成（タイムスタンプ + 元のファイル名）
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const fileName = `fortune-teller-${timestamp}.${extension}`

    // Supabase Storageにアップロード
    console.log('Uploading to storage:', fileName, file.type, file.size)
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json(
        {
          success: false,
          message: 'アップロードに失敗しました',
        },
        { status: 500 }
      )
    }

    console.log('Upload successful:', data)

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      data: {
        url: publicUrl,
        fileName: fileName,
      },
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
