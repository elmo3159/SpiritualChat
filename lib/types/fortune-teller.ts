/**
 * 占い師の型定義
 */
export interface FortuneTeller {
  id: string
  name: string
  title: string
  avatar_url: string
  specialties: string[]
  description: string
  rating: number
  system_prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * 占い師一覧表示用の簡略型
 */
export interface FortuneTellerCard {
  id: string
  name: string
  title: string
  avatar_url: string
  specialties: string[]
  rating: number
}

/**
 * データベースから取得した占い師データをFortuneTellerCardに変換
 */
export function toFortuneTellerCard(
  fortuneTeller: FortuneTeller
): FortuneTellerCard {
  return {
    id: fortuneTeller.id,
    name: fortuneTeller.name,
    title: fortuneTeller.title,
    avatar_url: fortuneTeller.avatar_url,
    specialties: fortuneTeller.specialties,
    rating: fortuneTeller.rating,
  }
}
