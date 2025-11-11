/**
 * 日時関連のユーティリティ関数
 */

/**
 * 生年月日から年齢を計算
 *
 * @param birthDate - 生年月日（YYYY-MM-DD形式）
 * @returns 年齢
 */
export function calculateAge(birthDate: string): number {
  const birth = new Date(birthDate)
  const today = new Date()

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  // 誕生日がまだ来ていない場合は1歳引く
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * 現在の日本時間を取得（フォーマット済み）
 *
 * @returns 日本時間の文字列（例：2025年1月7日（火）15時30分）
 */
export function getCurrentJapanTime(): string {
  const now = new Date()

  // 日本時間に変換（UTC+9）
  const japanTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }))

  const year = japanTime.getFullYear()
  const month = japanTime.getMonth() + 1
  const date = japanTime.getDate()
  const hours = japanTime.getHours()
  const minutes = japanTime.getMinutes()

  // 曜日を取得
  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[japanTime.getDay()]

  return `${year}年${month}月${date}日（${weekday}）${hours}時${minutes}分`
}
