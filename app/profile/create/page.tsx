'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, concernCategories, type ProfileFormData } from '@/lib/validations/profile'
import { createProfile } from '@/app/actions/profile'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { trackCompleteRegistration, trackTikTokIdentify } from '@/lib/analytics/tiktok-pixel'
import { useAuth } from '@/lib/contexts/AuthContext'

// 日本の都道府県リスト
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県',
  '沖縄県'
]

// 年齢の選択肢（10歳から100歳まで）
const AGE_OPTIONS = Array.from({ length: 91 }, (_, i) => i + 10)

export default function ProfileCreatePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usePartnerAge, setUsePartnerAge] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const concernCategory = watch('concernCategory')

  // 恋愛関連のカテゴリかどうか
  const isLoveCategory = concernCategory && ['恋愛', '片思い', '復縁', '不倫/浮気', '結婚'].includes(concernCategory)

  const onSubmit = async (data: ProfileFormData) => {
    setError(null)
    setLoading(true)

    try {
      const result = await createProfile(data)

      if (result && result.error) {
        setError(result.error)
        setLoading(false)
      } else if (result && result.success) {
        // TikTok Pixel: ユーザー識別情報を送信
        if (user?.email) {
          await trackTikTokIdentify(user.email, user.id)
        }

        // プロフィール登録完了イベントをトラッキング
        trackCompleteRegistration()

        // イベント送信完了を待つ（300ms）
        await new Promise(resolve => setTimeout(resolve, 300))

        // 成功時は占い師一覧ページに直接遷移
        router.push('/fortune-tellers')
      }
    } catch (err) {
      setError('予期しないエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-3xl">
        <div className="bg-gradient-to-br from-spiritual-purple/80 to-spiritual-light/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-spiritual-lavender/40 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-block">
              <div className="mb-4 flex justify-center">
                <Image
                  src="/images/logo.png?v=2"
                  alt="スピチャ"
                  width={240}
                  height={84}
                  className="w-auto h-16 md:h-20"
                  priority
                />
              </div>
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-clip-text text-transparent mb-2">
                プロフィール登録
              </h1>
              <p className="text-sm text-spiritual-lavender">あなたの情報を教えてください</p>
            </div>
          </div>

          {/* Info Message */}
          <div className="mb-6 p-4 bg-spiritual-lavender/20 border border-spiritual-lavender/40 rounded-xl text-sm text-gray-200 backdrop-blur-sm">
            <p className="font-medium mb-1 text-spiritual-gold">✨ より精度の高い鑑定のために</p>
            <p className="text-spiritual-lavender">
              すべての必須項目を入力してください。任意項目も入力いただくと、占い師がより詳しい鑑定を行えます。
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
            {/* 基本情報セクション */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
                基本情報
              </h2>

              {/* Nickname */}
              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-gray-200 mb-2">
                  ニックネーム <span className="text-red-400">*</span>
                </label>
                <input
                  id="nickname"
                  type="text"
                  {...register('nickname')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                  placeholder="例：さくら"
                />
                {errors.nickname && (
                  <p className="mt-1 text-sm text-red-300">{errors.nickname.message}</p>
                )}
              </div>

              {/* Birth Date */}
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200 mb-2">
                  生年月日 <span className="text-red-400">*</span>
                </label>
                <input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                />
                {errors.birthDate && (
                  <p className="mt-1 text-sm text-red-300">{errors.birthDate.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  性別 <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <label className="flex items-center justify-center px-3 py-3 md:py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[44px]">
                    <input
                      type="radio"
                      value="male"
                      {...register('gender')}
                      className="sr-only"
                    />
                    <span className="text-sm md:text-base font-medium text-gray-200">男性</span>
                  </label>
                  <label className="flex items-center justify-center px-3 py-3 md:py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[44px]">
                    <input
                      type="radio"
                      value="female"
                      {...register('gender')}
                      className="sr-only"
                    />
                    <span className="text-sm md:text-base font-medium text-gray-200">女性</span>
                  </label>
                  <label className="flex items-center justify-center px-3 py-3 md:py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[44px]">
                    <input
                      type="radio"
                      value="other"
                      {...register('gender')}
                      className="sr-only"
                    />
                    <span className="text-sm md:text-base font-medium text-gray-200">その他</span>
                  </label>
                </div>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-300">{errors.gender.message}</p>
                )}
              </div>
            </div>

            {/* 出生情報セクション（任意） */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
                出生情報（任意）
              </h2>

              {/* Birth Time */}
              <div>
                <label htmlFor="birthTime" className="block text-sm font-medium text-gray-200 mb-2">
                  出生時刻
                </label>
                <input
                  id="birthTime"
                  type="time"
                  {...register('birthTime')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                />
                {errors.birthTime && (
                  <p className="mt-1 text-sm text-red-300">{errors.birthTime.message}</p>
                )}
                <p className="mt-1 text-xs text-spiritual-lavender">母子手帳などで確認できる場合は入力してください</p>
              </div>

              {/* Prefecture Selection */}
              <div>
                <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-200 mb-2">
                  現在住んでいる都道府県
                </label>
                <select
                  id="birthPlace"
                  {...register('birthPlace')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                >
                  <option value="" className="bg-spiritual-dark text-gray-100">選択してください</option>
                  {PREFECTURES.map((prefecture) => (
                    <option key={prefecture} value={prefecture} className="bg-spiritual-dark text-gray-100">
                      {prefecture}
                    </option>
                  ))}
                </select>
                {errors.birthPlace && (
                  <p className="mt-1 text-sm text-red-300">{errors.birthPlace.message}</p>
                )}
                <p className="mt-1 text-xs text-spiritual-lavender">
                  現在お住まいの都道府県を選択してください
                </p>
              </div>
            </div>

            {/* お相手情報セクション（任意） */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
                お相手の情報（任意）
              </h2>

              <div className="p-3 md:p-4 bg-spiritual-accent/20 border border-spiritual-accent/40 rounded-xl text-sm text-gray-200 backdrop-blur-sm">
                <p>お相手がいらっしゃる場合は、以下の情報を入力してください。</p>
              </div>

              {/* Partner Name */}
              <div>
                <label htmlFor="partnerName" className="block text-sm font-medium text-gray-200 mb-2">
                  お相手の名前（ニックネーム可）
                </label>
                <input
                  id="partnerName"
                  type="text"
                  {...register('partnerName')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                  placeholder="例：たろう"
                />
                {errors.partnerName && (
                  <p className="mt-1 text-sm text-red-300">{errors.partnerName.message}</p>
                )}
              </div>

              {/* Partner Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  お相手の性別
                </label>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  <label className="flex items-center justify-center px-3 py-3 md:py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[44px]">
                    <input
                      type="radio"
                      value="male"
                      {...register('partnerGender')}
                      className="sr-only"
                    />
                    <span className="text-sm md:text-base font-medium text-gray-200">男性</span>
                  </label>
                  <label className="flex items-center justify-center px-3 py-3 md:py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[44px]">
                    <input
                      type="radio"
                      value="female"
                      {...register('partnerGender')}
                      className="sr-only"
                    />
                    <span className="text-sm md:text-base font-medium text-gray-200">女性</span>
                  </label>
                  <label className="flex items-center justify-center px-3 py-3 md:py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[44px]">
                    <input
                      type="radio"
                      value="other"
                      {...register('partnerGender')}
                      className="sr-only"
                    />
                    <span className="text-sm md:text-base font-medium text-gray-200">その他</span>
                  </label>
                </div>
                {errors.partnerGender && (
                  <p className="mt-1 text-sm text-red-300">{errors.partnerGender.message}</p>
                )}
              </div>

              {/* Partner Birth Date or Age */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-sm font-medium text-gray-200">
                    お相手の生年月日・年齢
                  </label>
                  <button
                    type="button"
                    onClick={() => setUsePartnerAge(!usePartnerAge)}
                    className="text-xs text-spiritual-gold hover:text-spiritual-accent underline transition-colors"
                  >
                    {usePartnerAge ? '生年月日で入力' : '年齢で入力'}
                  </button>
                </div>

                {!usePartnerAge ? (
                  <div>
                    <input
                      id="partnerBirthDate"
                      type="date"
                      {...register('partnerBirthDate')}
                      className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                    />
                    {errors.partnerBirthDate && (
                      <p className="mt-1 text-sm text-red-300">{errors.partnerBirthDate.message}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <select
                      id="partnerAge"
                      {...register('partnerAge', { valueAsNumber: true })}
                      className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                    >
                      <option value="" className="bg-spiritual-dark text-gray-100">大体の年齢を選択してください</option>
                      {AGE_OPTIONS.map((age) => (
                        <option key={age} value={age} className="bg-spiritual-dark text-gray-100">
                          {age}歳
                        </option>
                      ))}
                    </select>
                    {errors.partnerAge && (
                      <p className="mt-1 text-sm text-red-300">{errors.partnerAge.message}</p>
                    )}
                  </div>
                )}
                <p className="mt-1 text-xs text-spiritual-lavender">
                  生年月日がわからない場合は、大体の年齢を入力してください
                </p>
              </div>
            </div>

            {/* お悩み情報セクション */}
            <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
                お悩み情報
              </h2>

              {/* Concern Category */}
              <div>
                <label htmlFor="concernCategory" className="block text-sm font-medium text-gray-200 mb-2">
                  お悩みのカテゴリ <span className="text-red-400">*</span>
                </label>
                <select
                  id="concernCategory"
                  {...register('concernCategory')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                >
                  <option value="" className="bg-spiritual-dark text-gray-100">選択してください</option>
                  {concernCategories.map((category) => (
                    <option key={category} value={category} className="bg-spiritual-dark text-gray-100">
                      {category}
                    </option>
                  ))}
                </select>
                {errors.concernCategory && (
                  <p className="mt-1 text-sm text-red-300">{errors.concernCategory.message}</p>
                )}
              </div>

              {/* Concern Description */}
              <div>
                <label htmlFor="concernDescription" className="block text-sm font-medium text-gray-200 mb-2">
                  お悩みの内容 <span className="text-red-400">*</span>
                </label>
                <p className="text-xs md:text-sm text-spiritual-gold/90 mb-2">
                  長文でもOK！状況を詳しく書くことをおすすめしております。
                </p>
                <textarea
                  id="concernDescription"
                  {...register('concernDescription')}
                  rows={6}
                  maxLength={1000}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm resize-none text-base"
                  placeholder="あなたのお悩みを詳しく教えてください（最大1000文字）"
                />
                {errors.concernDescription && (
                  <p className="mt-1 text-sm text-red-300">{errors.concernDescription.message}</p>
                )}
                <p className="mt-1 text-xs text-spiritual-lavender text-right">
                  {watch('concernDescription')?.length || 0} / 1000文字
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-spiritual-gold/50 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:ring-offset-2 focus:ring-offset-spiritual-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg min-h-[52px] active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-spiritual-gold to-spiritual-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                {loading ? '登録中...' : 'プロフィールを登録'}
              </div>
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 md:mt-8 text-sm text-spiritual-lavender">
          登録した情報は、より精度の高い鑑定を提供するために使用されます
        </p>
      </div>
    </div>
  )
}
