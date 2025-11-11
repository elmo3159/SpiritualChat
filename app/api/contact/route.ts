import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

const CATEGORY_LABELS: Record<string, string> = {
  bug: 'バグ報告',
  feature: '機能要望',
  other: 'その他の問い合わせ',
}

/**
 * 問い合わせフォームAPI
 *
 * POST: 問い合わせを送信
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '未認証' }, { status: 401 })
    }

    // ユーザー情報を取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', user.id)
      .single()

    const userNickname = profile?.nickname || 'ユーザー'

    // FormDataから値を取得
    const formData = await request.formData()
    const category = formData.get('category') as string
    const message = formData.get('message') as string
    const imageFiles = formData.getAll('images') as File[]

    if (!category || !message) {
      return NextResponse.json(
        { error: 'カテゴリとメッセージは必須です' },
        { status: 400 }
      )
    }

    // 画像をbase64に変換
    const attachments = await Promise.all(
      imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64 = buffer.toString('base64')

        return {
          filename: file.name,
          content: base64,
        }
      })
    )

    // HTMLメール本文を作成
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #7c3aed; border-bottom: 2px solid #7c3aed; padding-bottom: 10px;">
          お問い合わせ: ${CATEGORY_LABELS[category] || category}
        </h2>

        <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
          <p style="margin: 5px 0;"><strong>送信者:</strong> ${userNickname}</p>
          <p style="margin: 5px 0;"><strong>ユーザーID:</strong> ${user.id}</p>
          <p style="margin: 5px 0;"><strong>メールアドレス:</strong> ${user.email || 'なし'}</p>
          <p style="margin: 5px 0;"><strong>カテゴリ:</strong> ${CATEGORY_LABELS[category] || category}</p>
        </div>

        <div style="margin: 20px 0;">
          <h3 style="color: #374151; margin-bottom: 10px;">お問い合わせ内容:</h3>
          <div style="padding: 15px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; white-space: pre-wrap;">
${message}
          </div>
        </div>

        ${
          attachments.length > 0
            ? `
        <div style="margin: 20px 0;">
          <p style="color: #6b7280;"><strong>添付画像:</strong> ${attachments.length}枚</p>
        </div>
        `
            : ''
        }

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
          <p>このメールは スピチャ のお問い合わせフォームから送信されました。</p>
          <p>送信日時: ${new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}</p>
        </div>
      </div>
    `

    // Resendでメールを送信
    const supportEmail = process.env.SUPPORT_EMAIL || 'noreply@example.com'

    const { data, error } = await resend.emails.send({
      from: 'スピチャ お問い合わせ <onboarding@resend.dev>',
      to: [supportEmail],
      replyTo: user.email || undefined,
      subject: `[スピチャ] ${CATEGORY_LABELS[category]}: ${userNickname}様からのお問い合わせ`,
      html: htmlBody,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    if (error) {
      console.error('Resend送信エラー:', error)
      console.error('エラー詳細:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        {
          error: 'メールの送信に失敗しました',
          details: error.message || 'Unknown error'
        },
        { status: 500 }
      )
    }

    console.log('お問い合わせメール送信成功:', data)

    return NextResponse.json({
      success: true,
      message: 'お問い合わせを送信しました',
    })
  } catch (error) {
    console.error('お問い合わせ送信エラー:', error)
    return NextResponse.json(
      { error: 'お問い合わせの送信に失敗しました' },
      { status: 500 }
    )
  }
}
