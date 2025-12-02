import { NextRequest, NextResponse } from 'next/server'

/**
 * Vercel Cron Job用のエンドポイント
 * 毎日JST 0:00（UTC 15:00）に実行
 */
export async function GET(req: NextRequest) {
  try {
    // Vercel Cronからの呼び出しを検証
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Cron job started: generate-horoscope')

    // Supabase Edge Functionを呼び出す
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/generate-daily-horoscope`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
        },
        body: JSON.stringify({ source: 'vercel-cron' }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Edge Function error:', errorText)
      throw new Error(`Edge Function failed: ${response.status}`)
    }

    const result = await response.json()
    console.log('Cron job completed:', result)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

// Vercel Cronは GETリクエストを使用
export const dynamic = 'force-dynamic'
export const maxDuration = 60
