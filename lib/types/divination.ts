/**
 * 鑑定機能の型定義
 *
 * AI占い師による鑑定結果の型を定義します
 */

/**
 * 鑑定結果の状態
 */
export type DivinationStatus = 'locked' | 'unlocked'

/**
 * 鑑定結果（完全版）
 * データベースから取得する形式
 */
export interface DivinationResult {
  id: string
  user_id: string
  fortune_teller_id: string
  greeting_message: string
  result_encrypted: string
  result_preview: string
  after_message: string
  is_unlocked: boolean
  points_consumed: number | null
  unlocked_at: string | null
  created_at: string
  updated_at: string
}

/**
 * 鑑定結果（表示用）
 * クライアントで表示する形式
 */
export interface DivinationResultDisplay {
  id: string
  greetingMessage: string // 鑑定前メッセージ
  resultPreview: string // 最初の20文字
  resultFull?: string // 開封後のみ利用可能
  resultLength?: number // 鑑定結果の文字数（未開封時のみ）
  afterMessage: string // 鑑定後メッセージ
  isUnlocked: boolean
  pointsConsumed: number | null
  unlockedAt: string | null
  createdAt: string
}

/**
 * 鑑定生成リクエスト
 */
export interface GenerateDivinationRequest {
  fortuneTellerId: string
}

/**
 * 鑑定生成レスポンス
 */
export interface GenerateDivinationResponse {
  success: boolean
  message?: string
  data?: {
    divination: DivinationResultDisplay
  }
}

/**
 * 鑑定開封リクエスト
 */
export interface UnlockDivinationRequest {
  divinationId: string
}

/**
 * 鑑定開封レスポンス
 */
export interface UnlockDivinationResponse {
  success: boolean
  message?: string
  data?: {
    resultFull: string
    pointsConsumed: number
    newBalance: number
  }
}

/**
 * ポイント残高取得レスポンス
 */
export interface PointsBalanceResponse {
  success: boolean
  message?: string
  data?: {
    balance: number
  }
}
