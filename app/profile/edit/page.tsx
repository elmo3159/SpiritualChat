'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import {
  profileSchema,
  concernCategories,
  type ProfileFormData,
} from '@/lib/validations/profile'
import { getProfile, updateProfile } from '@/app/actions/profile'

// 年齢選択用の配列を生成（18～100歳）
const AGE_OPTIONS = Array.from({ length: 83 }, (_, i) => i + 18)

/**
 * プロフィール編集ページ
 *
 * 登録済みのプロフィール情報を編集できるページ
 * 作成ページと同じ構造で、既存データを事前入力
 */
export default function ProfileEditPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usePartnerAge, setUsePartnerAge] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // 既存のプロフィールデータを取得
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true)
        const result = await getProfile()

        if (!result.success || !result.data) {
          setError(result.error || 'プロフィールの取得に失敗しました')
          return
        }

        // フォームに既存データをセット
        const profile = result.data
        setValue('nickname', profile.nickname || '')
        setValue('birthDate', profile.birth_date || '')
        setValue('birthTime', profile.birth_time || '')
        setValue('birthPlace', profile.birth_place || '')
        setValue('gender', profile.gender || 'other')
        setValue('concernCategory', profile.concern_category || '恋愛')
        setValue('concernDescription', profile.concern_description || '')
        setValue('partnerName', profile.partner_name || '')
        setValue('partnerGender', profile.partner_gender || undefined)
        setValue('partnerBirthDate', profile.partner_birth_date || '')
        setValue('partnerAge', profile.partner_age || undefined)

        // 年齢が設定されている場合は年齢入力モードに
        if (profile.partner_age) {
          setUsePartnerAge(true)
        }
      } catch (err) {
        console.error('プロフィール取得エラー:', err)
        setError('プロフィールの取得に失敗しました')
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [setValue])

  const concernCategory = watch('concernCategory')
  const isLoveCategory =
    concernCategory &&
    ['恋愛', '片思い', '復縁', '不倫/浮気', '結婚'].includes(concernCategory)

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      const result = await updateProfile(data)

      if (!result.success) {
        setError(result.error || 'プロフィールの更新に失敗しました')
        return
      }

      // 更新成功
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('プロフィール更新エラー:', err)
      setError('予期しないエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-spiritual-gold/30 border-t-spiritual-gold rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-100 text-base md:text-lg">プロフィールを読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple py-6 md:py-8 px-4 pb-20">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-spiritual-lavender/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-spiritual-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-spiritual-lavender hover:text-spiritual-gold transition-colors mb-3 md:mb-4 active:scale-95 transition-transform min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm md:text-base">占い師選択に戻る</span>
          </Link>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-100 mb-2">
            プロフィール編集
          </h1>
          <p className="text-sm md:text-base text-spiritual-lavender">
            あなたの情報を更新してください
          </p>
        </div>

        {/* フォーム */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-spiritual-purple/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-spiritual-lavender/30 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8"
        >
          {/* エラーメッセージ */}
          {error && (
            <div className="px-4 py-3 bg-red-900/50 border border-red-700/50 rounded-xl backdrop-blur-sm">
              <p className="text-sm text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* 基本情報 */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
              基本情報
            </h2>

            {/* ニックネーム */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                ニックネーム <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                {...register('nickname')}
                className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                placeholder="例：さくら"
              />
              {errors.nickname && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.nickname.message}
                </p>
              )}
            </div>

            {/* 生年月日 */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                生年月日 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                {...register('birthDate')}
                className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
              />
              {errors.birthDate && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.birthDate.message}
                </p>
              )}
            </div>

            {/* 性別 */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                性別 <span className="text-red-400">*</span>
              </label>
              <select
                {...register('gender')}
                className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
              >
                <option value="male" className="bg-spiritual-darker">
                  男性
                </option>
                <option value="female" className="bg-spiritual-darker">
                  女性
                </option>
                <option value="other" className="bg-spiritual-darker">
                  その他
                </option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>

          {/* 出生情報（任意） */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
              出生情報（任意）
            </h2>

            {/* 出生時刻 */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                出生時刻
              </label>
              <input
                type="time"
                {...register('birthTime')}
                className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
              />
              <p className="mt-1 text-xs md:text-sm text-spiritual-lavender">
                より正確な鑑定のために入力してください
              </p>
              {errors.birthTime && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.birthTime.message}
                </p>
              )}
            </div>

            {/* 現在住んでいる都道府県 */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                現在住んでいる都道府県
              </label>
              <input
                type="text"
                {...register('birthPlace')}
                className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                placeholder="例：東京都"
              />
              {errors.birthPlace && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.birthPlace.message}
                </p>
              )}
            </div>
          </div>

          {/* お相手の情報（任意） */}
          <div className="space-y-4 md:space-y-6">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
                お相手の情報（任意）
              </h2>

              {/* お相手の名前 */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                  お相手の名前
                </label>
                <input
                  type="text"
                  {...register('partnerName')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                  placeholder="例：太郎"
                />
                {errors.partnerName && (
                  <p className="mt-1 text-sm text-red-300">
                    {errors.partnerName.message}
                  </p>
                )}
              </div>

              {/* お相手の性別 */}
              <div>
                <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                  お相手の性別
                </label>
                <select
                  {...register('partnerGender')}
                  className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                >
                  <option value="" className="bg-spiritual-darker">
                    選択してください
                  </option>
                  <option value="male" className="bg-spiritual-darker">
                    男性
                  </option>
                  <option value="female" className="bg-spiritual-darker">
                    女性
                  </option>
                  <option value="other" className="bg-spiritual-darker">
                    その他
                  </option>
                </select>
                {errors.partnerGender && (
                  <p className="mt-1 text-sm text-red-300">
                    {errors.partnerGender.message}
                  </p>
                )}
              </div>

              {/* お相手の生年月日 or 年齢 */}
              <div>
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <label className="block text-sm md:text-base font-semibold text-gray-100">
                    お相手の生年月日 / 年齢
                  </label>
                  <button
                    type="button"
                    onClick={() => setUsePartnerAge(!usePartnerAge)}
                    className="text-sm md:text-base text-spiritual-lavender hover:text-spiritual-gold underline transition-colors min-h-[44px]"
                  >
                    {usePartnerAge ? '生年月日で入力' : '年齢で入力'}
                  </button>
                </div>

                {!usePartnerAge ? (
                  <>
                    <input
                      type="date"
                      {...register('partnerBirthDate')}
                      className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                    />
                    {errors.partnerBirthDate && (
                      <p className="mt-1 text-sm text-red-300">
                        {errors.partnerBirthDate.message}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <select
                      {...register('partnerAge', { valueAsNumber: true })}
                      className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
                    >
                      <option value="" className="bg-spiritual-darker">
                        選択してください
                      </option>
                      {AGE_OPTIONS.map((age) => (
                        <option key={age} value={age} className="bg-spiritual-darker">
                          {age}歳
                        </option>
                      ))}
                    </select>
                    {errors.partnerAge && (
                      <p className="mt-1 text-sm text-red-300">
                        {errors.partnerAge.message}
                      </p>
                    )}
                  </>
                )}
                <p className="mt-1 text-xs md:text-sm text-spiritual-lavender">
                  わからない場合は大体の年齢を入力してください
                </p>
              </div>
          </div>

          {/* お悩み情報 */}
          <div className="space-y-4 md:space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 bg-gradient-to-r from-spiritual-lavender/90 to-spiritual-lavender-light/90 rounded-lg px-4 py-3 border-b-2 border-spiritual-gold/50 shadow-lg">
              お悩み情報
            </h2>

            {/* お悩みのカテゴリ */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                お悩みのカテゴリ <span className="text-red-400">*</span>
              </label>
              <select
                {...register('concernCategory')}
                className="w-full px-4 py-3 md:py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[44px]"
              >
                {concernCategories.map((category) => (
                  <option key={category} value={category} className="bg-spiritual-darker">
                    {category}
                  </option>
                ))}
              </select>
              {errors.concernCategory && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.concernCategory.message}
                </p>
              )}
            </div>

            {/* お悩みの内容 */}
            <div>
              <label className="block text-sm md:text-base font-semibold text-gray-100 mb-2">
                お悩みの内容 <span className="text-red-400">*</span>
              </label>
              <p className="text-xs md:text-sm text-spiritual-gold/90 mb-2">
                長文でもOK！状況を詳しく書くことをおすすめしております。
              </p>
              <textarea
                {...register('concernDescription')}
                rows={6}
                className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm resize-none text-base"
                placeholder="あなたのお悩みを詳しく教えてください..."
              />
              <div className="flex justify-between items-center mt-1 flex-wrap gap-2">
                <p className="text-xs md:text-sm text-spiritual-lavender">
                  詳しく書いていただくほど、的確な鑑定ができます
                </p>
                <p className="text-xs md:text-sm text-spiritual-lavender font-medium">
                  {watch('concernDescription')?.length || 0} / 1000文字
                </p>
              </div>
              {errors.concernDescription && (
                <p className="mt-1 text-sm text-red-300">
                  {errors.concernDescription.message}
                </p>
              )}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="pt-4 md:pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 md:py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-spiritual-gold/50 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:ring-offset-2 focus:ring-offset-spiritual-dark transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base md:text-lg min-h-[52px] active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-spiritual-gold to-spiritual-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-spiritual-dark/30 border-t-spiritual-dark rounded-full animate-spin" />
                    <span>更新中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>プロフィールを更新</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
