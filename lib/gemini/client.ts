import { GoogleGenAI } from '@google/genai'
import type { FullDivinationResult } from './types'

/**
 * Gemini APIクライアント
 *
 * Google Generative AI (Gemini) APIを使用してコンテンツを生成します
 */

// 環境変数からAPIキーを取得
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables')
}

// GoogleGenAIクライアントの初期化
export const geminiClient = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
})

// デフォルトモデルの設定（Gemini 2.5 Pro - 高度な推論モデル）
export const DEFAULT_MODEL = 'gemini-2.5-pro'

/**
 * コンテンツ生成
 *
 * @param prompt - 生成するコンテンツのプロンプト
 * @param model - 使用するモデル名（デフォルト: gemini-2.5-pro）
 * @returns 生成されたテキスト
 */
export async function generateContent(
  prompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const response = await geminiClient.models.generateContent({
      model,
      contents: prompt,
    })
    if (!response.text) {
      throw new Error('Gemini API returned empty response')
    }
    return response.text
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error(`Failed to generate content: ${error}`)
  }
}

/**
 * ストリーミングでコンテンツ生成
 *
 * リアルタイムでテキストを生成し、チャンクごとにyieldします
 *
 * @param prompt - 生成するコンテンツのプロンプト
 * @param model - 使用するモデル名（デフォルト: gemini-2.5-pro）
 * @yields 生成されたテキストのチャンク
 */
export async function* generateContentStream(
  prompt: string,
  model: string = DEFAULT_MODEL
): AsyncGenerator<string, void, unknown> {
  try {
    const response = await geminiClient.models.generateContentStream({
      model,
      contents: prompt,
    })
    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text
      }
    }
  } catch (error) {
    console.error('Gemini API streaming error:', error)
    throw new Error(`Failed to generate content stream: ${error}`)
  }
}

/**
 * カスタム設定でコンテンツ生成
 *
 * より詳細な設定を行う場合に使用します
 *
 * @param params - 生成パラメータ
 * @returns 生成されたテキスト
 */
export async function generateWithConfig(params: {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  topP?: number
  topK?: number
}): Promise<string> {
  try {
    const {
      prompt,
      model = DEFAULT_MODEL,
      temperature,
      maxTokens,
      topP,
      topK,
    } = params

    const config: any = {}

    if (temperature !== undefined) config.temperature = temperature
    if (maxTokens !== undefined) config.maxOutputTokens = maxTokens
    if (topP !== undefined) config.topP = topP
    if (topK !== undefined) config.topK = topK

    const response = await geminiClient.models.generateContent({
      model,
      contents: prompt,
      ...(Object.keys(config).length > 0 && { config }),
    })

    if (!response.text) {
      throw new Error('Gemini API returned empty response')
    }
    return response.text
  } catch (error) {
    console.error('Gemini API config error:', error)
    throw new Error(`Failed to generate content with config: ${error}`)
  }
}

/**
 * 完全な鑑定結果を生成してパース
 *
 * Gemini APIに鑑定プロンプトを送信し、3つのメッセージに分割して返します
 * 最大3回リトライします
 *
 * @param prompt - 鑑定プロンプト
 * @param model - 使用するモデル名
 * @returns パースされた鑑定結果
 */
export async function generateFullDivination(
  prompt: string,
  model: string = DEFAULT_MODEL
): Promise<FullDivinationResult> {
  const maxRetries = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`鑑定結果生成試行 ${attempt}/${maxRetries}`)

      // Gemini APIで鑑定結果を生成
      const response = await generateContent(prompt, model)

      // レスポンスをパース
      const parsed = parseFullDivinationResponse(response)

      console.log('鑑定結果生成成功')
      return {
        ...parsed,
        generatedAt: new Date(),
      }
    } catch (error) {
      console.error(`鑑定結果生成試行 ${attempt} 失敗:`, error)
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < maxRetries) {
        // 次の試行前に少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  // すべてのリトライが失敗した場合
  throw new Error(`鑑定結果の生成に失敗しました（最大リトライ回数に達しました）: ${lastError?.message}`)
}

/**
 * 鑑定結果のレスポンスをパース
 *
 * [GREETING]、[RESULT]、[AFTER]の3つのセクションに分割します
 *
 * @param response - Gemini APIのレスポンステキスト
 * @returns パースされた鑑定結果
 */
export function parseFullDivinationResponse(response: string): {
  greetingMessage: string
  resultMessage: string
  afterMessage: string
} {
  try {
    // [GREETING]セクションを抽出
    const greetingMatch = response.match(/\[GREETING\]\s*\n([\s\S]*?)(?=\[RESULT\]|$)/)
    const greetingMessage = greetingMatch
      ? greetingMatch[1].trim()
      : ''

    // [RESULT]セクションを抽出
    const resultMatch = response.match(/\[RESULT\]\s*\n([\s\S]*?)(?=\[AFTER\]|$)/)
    const resultMessage = resultMatch
      ? resultMatch[1].trim()
      : ''

    // [AFTER]セクションを抽出
    const afterMatch = response.match(/\[AFTER\]\s*\n([\s\S]*?)$/)
    const afterMessage = afterMatch
      ? afterMatch[1].trim()
      : ''

    // パースに失敗した場合のエラーハンドリング
    if (!greetingMessage || !resultMessage || !afterMessage) {
      console.error('パース失敗。レスポンス:', response)
      throw new Error('鑑定結果のパースに失敗しました')
    }

    return {
      greetingMessage,
      resultMessage,
      afterMessage,
    }
  } catch (error) {
    console.error('鑑定結果パースエラー:', error)
    throw new Error(`鑑定結果のパースに失敗しました: ${error}`)
  }
}
