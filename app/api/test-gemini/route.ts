import { NextResponse } from 'next/server'
import { generateContent } from '@/lib/gemini'

/**
 * Gemini APIのテストエンドポイント
 *
 * GET /api/test-gemini
 *
 * Gemini APIクライアントが正しく動作するかテストします
 */
export async function GET() {
  try {
    // テストプロンプト
    const testPrompt = 'こんにちは！あなたは占い師です。簡単な自己紹介をしてください。'

    console.log('Gemini APIをテスト中...')
    console.log('プロンプト:', testPrompt)

    // Gemini APIを呼び出し
    const response = await generateContent(testPrompt)

    console.log('Gemini API レスポンス:', response)

    return NextResponse.json({
      success: true,
      message: 'Gemini API is working correctly',
      prompt: testPrompt,
      response: response,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Gemini APIテストエラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Gemini API test failed',
        error: error.message || 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
