export interface ZodiacSign {
  id: string
  nameJa: string
  nameEn: string
  symbol: string
  dateRange: string
  displayOrder: number
  color: string // テーマカラー
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    id: 'aries',
    nameJa: '牡羊座',
    nameEn: 'Aries',
    symbol: '♈',
    dateRange: '3/21-4/19',
    displayOrder: 1,
    color: '#e88ca5', // ピンク
  },
  {
    id: 'taurus',
    nameJa: '牡牛座',
    nameEn: 'Taurus',
    symbol: '♉',
    dateRange: '4/20-5/20',
    displayOrder: 2,
    color: '#d4af37', // ゴールド
  },
  {
    id: 'gemini',
    nameJa: '双子座',
    nameEn: 'Gemini',
    symbol: '♊',
    dateRange: '5/21-6/21',
    displayOrder: 3,
    color: '#b76e79', // ローズピンク
  },
  {
    id: 'cancer',
    nameJa: '蟹座',
    nameEn: 'Cancer',
    symbol: '♋',
    dateRange: '6/22-7/22',
    displayOrder: 4,
    color: '#c9a961', // ライトゴールド
  },
  {
    id: 'leo',
    nameJa: '獅子座',
    nameEn: 'Leo',
    symbol: '♌',
    dateRange: '7/23-8/22',
    displayOrder: 5,
    color: '#f4c2c2', // ライトピンク
  },
  {
    id: 'virgo',
    nameJa: '乙女座',
    nameEn: 'Virgo',
    symbol: '♍',
    dateRange: '8/23-9/22',
    displayOrder: 6,
    color: '#b8a6d9', // ラベンダー
  },
  {
    id: 'libra',
    nameJa: '天秤座',
    nameEn: 'Libra',
    symbol: '♎',
    dateRange: '9/23-10/23',
    displayOrder: 7,
    color: '#d4719f', // ダークピンク
  },
  {
    id: 'scorpio',
    nameJa: '蠍座',
    nameEn: 'Scorpio',
    symbol: '♏',
    dateRange: '10/24-11/22',
    displayOrder: 8,
    color: '#8b5a3c', // ブラウン
  },
  {
    id: 'sagittarius',
    nameJa: '射手座',
    nameEn: 'Sagittarius',
    symbol: '♐',
    dateRange: '11/23-12/21',
    displayOrder: 9,
    color: '#c8b8db', // ライトパープル
  },
  {
    id: 'capricorn',
    nameJa: '山羊座',
    nameEn: 'Capricorn',
    symbol: '♑',
    dateRange: '12/22-1/19',
    displayOrder: 10,
    color: '#a0522d', // シエナブラウン
  },
  {
    id: 'aquarius',
    nameJa: '水瓶座',
    nameEn: 'Aquarius',
    symbol: '♒',
    dateRange: '1/20-2/18',
    displayOrder: 11,
    color: '#ffc0cb', // ベビーピンク
  },
  {
    id: 'pisces',
    nameJa: '魚座',
    nameEn: 'Pisces',
    symbol: '♓',
    dateRange: '2/19-3/20',
    displayOrder: 12,
    color: '#dda0dd', // プラム
  },
]

export function getZodiacSign(id: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((sign) => sign.id === id)
}

export function getZodiacSignByDate(month: number, day: number): ZodiacSign | undefined {
  // 生年月日から星座を判定
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return ZODIAC_SIGNS[0] // 牡羊座
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return ZODIAC_SIGNS[1] // 牡牛座
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return ZODIAC_SIGNS[2] // 双子座
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return ZODIAC_SIGNS[3] // 蟹座
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return ZODIAC_SIGNS[4] // 獅子座
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return ZODIAC_SIGNS[5] // 乙女座
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return ZODIAC_SIGNS[6] // 天秤座
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return ZODIAC_SIGNS[7] // 蠍座
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return ZODIAC_SIGNS[8] // 射手座
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return ZODIAC_SIGNS[9] // 山羊座
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return ZODIAC_SIGNS[10] // 水瓶座
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return ZODIAC_SIGNS[11] // 魚座
  return undefined
}

// 星の表示（レーティング用）
export function getRatingStars(rating: number): string {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
