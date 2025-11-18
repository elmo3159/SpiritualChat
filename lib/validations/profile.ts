import { z } from 'zod'

// お悩みのカテゴリ
export const concernCategories = [
  '恋愛',
  '片思い',
  '復縁',
  '不倫/浮気',
  '結婚',
  '仕事',
  '家庭問題',
  '金運',
] as const

export const profileSchema = z.object({
  // 必須項目
  nickname: z
    .string()
    .min(1, 'ニックネームを入力してください')
    .max(50, 'ニックネームは50文字以内で入力してください'),

  birthDate: z
    .string()
    .min(1, '生年月日を入力してください')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 150
    }, '正しい生年月日を入力してください'),

  gender: z
    .enum(['male', 'female', 'other'], {
      required_error: '性別を選択してください',
    }),

  concernCategory: z
    .enum(concernCategories, {
      required_error: 'お悩みのカテゴリを選択してください',
    }),

  concernDescription: z
    .string()
    .min(1, 'お悩みの内容を入力してください')
    .max(1000, 'お悩みの内容は1000文字以内で入力してください'),

  // 任意項目
  birthTime: z
    .union([
      z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, '正しい時刻を入力してください（例：14:30）'),
      z.literal(''),
      z.undefined(),
    ])
    .optional(),

  birthPlace: z
    .string()
    .max(100, '現在住んでいる都道府県は100文字以内で入力してください')
    .optional(),

  // お相手の情報（任意）
  partnerName: z
    .string()
    .max(50, 'お相手の名前は50文字以内で入力してください')
    .optional(),

  partnerGender: z
    .enum(['male', 'female', 'other'])
    .optional(),

  partnerBirthDate: z
    .string()
    .optional()
    .refine((date) => {
      if (!date) return true
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 0 && age <= 150
    }, '正しい生年月日を入力してください'),

  partnerAge: z
    .number()
    .min(0, '年齢は0歳以上で入力してください')
    .max(150, '年齢は150歳以下で入力してください')
    .optional(),
})

export type ProfileFormData = z.infer<typeof profileSchema>
