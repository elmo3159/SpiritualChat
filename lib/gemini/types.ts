/**
 * Gemini API 型定義
 *
 * Gemini APIで使用する型を定義します
 */

/**
 * コンテンツ生成のパラメータ
 */
export interface GenerateContentParams {
  /** 生成するコンテンツのプロンプト */
  prompt: string
  /** 使用するモデル名 */
  model?: string
  /** 生成の温度（0.0-2.0）- 高いほどランダム性が増す */
  temperature?: number
  /** 最大出力トークン数 */
  maxTokens?: number
  /** Top-p サンプリング（0.0-1.0） */
  topP?: number
  /** Top-k サンプリング */
  topK?: number
}

/**
 * 占い師の性格設定
 */
export interface FortuneTellerPersonality {
  /** 占い師の名前 */
  name: string
  /** 占い師のタイトル・肩書き */
  title: string
  /** 占い師の性格・話し方の特徴 */
  personality: string
  /** 得意な占術 */
  specialties: string[]
  /** 話し方のトーン */
  tone: string
}

/**
 * チャットメッセージの履歴
 */
export interface ChatHistory {
  /** 送信者タイプ */
  role: 'user' | 'assistant'
  /** メッセージ内容 */
  content: string
}

/**
 * 占いセッションのコンテキスト
 */
export interface DivinationContext {
  /** ユーザーのニックネーム */
  userNickname: string
  /** ユーザーの生年月日 */
  birthDate: string
  /** ユーザーの年齢 */
  userAge: number
  /** ユーザーの性別 */
  gender: string
  /** お悩みのカテゴリ */
  concernCategory: string
  /** お悩みの内容 */
  concernDescription: string
  /** 出生時刻（オプション） */
  birthTime?: string
  /** 出生地（オプション） */
  birthPlace?: string
  /** お相手の名前（オプション） */
  partnerName?: string
  /** お相手の性別（オプション） */
  partnerGender?: string
  /** お相手の生年月日（オプション） */
  partnerBirthDate?: string
  /** お相手の年齢（オプション） */
  partnerAge?: number
  /** チャット履歴 */
  chatHistory: ChatHistory[]
  /** 過去の鑑定結果（オプション） */
  previousDivinations?: string[]
  /** 現在の日本時間 */
  currentJapanTime: string
}

/**
 * 占い結果の構造
 */
export interface DivinationResult {
  /** 第1部: 現状分析 */
  currentSituation: string
  /** 第2部: 未来予測 */
  futurePrediction: string
  /** 第3部: アドバイス */
  advice: string
  /** 生成日時 */
  generatedAt: Date
}

/**
 * 完全な鑑定結果（3通のメッセージ形式）
 */
export interface FullDivinationResult {
  /** 鑑定前メッセージ */
  greetingMessage: string
  /** 鑑定結果本文（400文字程度） */
  resultMessage: string
  /** 鑑定後メッセージ */
  afterMessage: string
  /** 生成日時 */
  generatedAt: Date
}

/**
 * Gemini APIのエラー
 */
export interface GeminiApiError {
  /** エラーメッセージ */
  message: string
  /** エラーコード */
  code?: string
  /** エラーの詳細 */
  details?: any
}
