/**
 * Gemini API モジュール
 *
 * このモジュールは、Google Generative AI (Gemini) APIを
 * Next.jsアプリケーションで使いやすくラップしたものです。
 */

export {
  geminiClient,
  DEFAULT_MODEL,
  generateContent,
  generateContentStream,
  generateWithConfig,
} from './client'

export type {
  GenerateContentParams,
  FortuneTellerPersonality,
  ChatHistory,
  DivinationContext,
  DivinationResult,
  GeminiApiError,
} from './types'
