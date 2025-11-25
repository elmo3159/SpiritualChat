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
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronDown, ChevronUp, Sparkles, Heart, Briefcase, Home, Coins, Users, MessageCircle, Star, Check } from 'lucide-react'

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

// 年齢の選択肢
const AGE_OPTIONS = Array.from({ length: 91 }, (_, i) => i + 10)

// カテゴリのアイコンと色
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  '恋愛': { icon: <Heart className="w-6 h-6" />, color: 'text-pink-500', bgColor: 'bg-pink-500/20' },
  '片思い': { icon: <Heart className="w-6 h-6" />, color: 'text-rose-400', bgColor: 'bg-rose-400/20' },
  '復縁': { icon: <Heart className="w-6 h-6" />, color: 'text-purple-400', bgColor: 'bg-purple-400/20' },
  '不倫/浮気': { icon: <Heart className="w-6 h-6" />, color: 'text-red-400', bgColor: 'bg-red-400/20' },
  '結婚': { icon: <Users className="w-6 h-6" />, color: 'text-orange-400', bgColor: 'bg-orange-400/20' },
  '仕事': { icon: <Briefcase className="w-6 h-6" />, color: 'text-blue-400', bgColor: 'bg-blue-400/20' },
  '家庭問題': { icon: <Home className="w-6 h-6" />, color: 'text-green-400', bgColor: 'bg-green-400/20' },
  '金運': { icon: <Coins className="w-6 h-6" />, color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
}

// お悩みテンプレート
const concernTemplates: Record<string, string[]> = {
  '恋愛': [
    '付き合っている人との関係に悩んでいます。最近少し距離を感じるようになりました。',
    'パートナーとの将来について不安を感じています。このまま一緒にいていいのか迷っています。',
    '彼（彼女）の気持ちが分からなくなりました。私のことをどう思っているのか知りたいです。',
  ],
  '片思い': [
    '職場（学校）で気になる人がいます。どうアプローチすればいいか分かりません。',
    '友人として仲が良い人のことが気になり始めました。この気持ちを伝えるべきか悩んでいます。',
    '好きな人がいますが、相手の気持ちが分かりません。脈があるのか知りたいです。',
  ],
  '復縁': [
    '別れた元恋人のことが忘れられません。復縁の可能性はあるでしょうか。',
    '別れてから時間が経ちましたが、まだ相手のことを想っています。連絡を取るべきか迷っています。',
    '元カレ（元カノ）と復縁したいです。どうすれば関係を修復できるでしょうか。',
  ],
  '不倫/浮気': [
    '複雑な恋愛関係で悩んでいます。この先どうすればいいか分かりません。',
    '好きになった人には相手がいます。この気持ちとどう向き合えばいいでしょうか。',
    '今の関係をこのまま続けていいのか悩んでいます。',
  ],
  '結婚': [
    '今のパートナーと結婚すべきか悩んでいます。相性や将来について知りたいです。',
    '結婚を考えていますが、タイミングが分かりません。いつ頃がいいでしょうか。',
    '婚活中ですが、なかなか良い出会いがありません。いつ頃結婚できるでしょうか。',
  ],
  '仕事': [
    '転職を考えています。今の仕事を続けるべきか、新しい道に進むべきか悩んでいます。',
    '職場の人間関係に悩んでいます。どう対処すればいいでしょうか。',
    '今後のキャリアについて迷っています。自分に向いている仕事は何でしょうか。',
  ],
  '家庭問題': [
    '家族との関係がうまくいっていません。どうすれば改善できるでしょうか。',
    '親との関係に悩んでいます。距離感をどうとればいいか分かりません。',
    '家庭内の問題で困っています。解決の糸口を見つけたいです。',
  ],
  '金運': [
    '最近お金の巡りが悪いように感じます。金運を上げるにはどうすればいいでしょうか。',
    '投資や副業を始めようか迷っています。今がいいタイミングでしょうか。',
    '将来の経済的な不安があります。お金に関するアドバイスをお願いします。',
  ],
}

// 占い師の型
interface FortuneTeller {
  id: string
  name: string
  avatar_url: string
  specialty: string
  description: string
}

// プログレスバーコンポーネント
function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  const steps = [
    { num: 1, label: '基本情報' },
    { num: 2, label: 'お悩み' },
    { num: 3, label: '完了' },
  ]

  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center justify-between relative">
        {/* 接続線（背景） */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-spiritual-lavender/30" />

        {/* 接続線（進捗） */}
        <div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-spiritual-gold to-spiritual-accent transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step) => (
          <div key={step.num} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                currentStep >= step.num
                  ? 'bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-spiritual-dark shadow-lg shadow-spiritual-gold/50'
                  : 'bg-spiritual-dark/50 text-gray-400 border-2 border-spiritual-lavender/40'
              }`}
            >
              {currentStep > step.num ? (
                <Check className="w-5 h-5" />
              ) : (
                step.num
              )}
            </div>
            <span className={`mt-2 text-xs font-medium ${
              currentStep >= step.num ? 'text-spiritual-gold' : 'text-gray-400'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ProfileCreatePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usePartnerAge, setUsePartnerAge] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showOptionalInfo, setShowOptionalInfo] = useState(false)
  const [fortuneTellers, setFortuneTellers] = useState<FortuneTeller[]>([])
  const router = useRouter()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
  })

  const concernCategory = watch('concernCategory')
  const concernDescription = watch('concernDescription')

  // 恋愛関連のカテゴリかどうか
  const isLoveCategory = concernCategory && ['恋愛', '片思い', '復縁', '不倫/浮気', '結婚'].includes(concernCategory)

  // 占い師を取得
  useEffect(() => {
    const fetchFortuneTellers = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('fortune_tellers')
        .select('id, name, avatar_url, specialty, description')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .limit(2)

      if (data) {
        setFortuneTellers(data)
      }
    }
    fetchFortuneTellers()
  }, [])

  // テンプレート選択時
  const handleTemplateSelect = (template: string) => {
    setSelectedTemplate(template)
    setValue('concernDescription', template)
  }

  // Step1のバリデーション
  const validateStep1 = async () => {
    const result = await trigger(['nickname', 'birthDate', 'gender'])
    return result
  }

  // Step2のバリデーション
  const validateStep2 = async () => {
    const result = await trigger(['concernCategory', 'concernDescription'])
    return result
  }

  // 次のステップへ
  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1()
      if (isValid) setCurrentStep(2)
    } else if (currentStep === 2) {
      const isValid = await validateStep2()
      if (isValid) setCurrentStep(3)
    }
  }

  // 前のステップへ
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

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

        // イベント送信完了を待つ
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
      <div className="w-full max-w-2xl">
        <div className="bg-gradient-to-br from-spiritual-purple/80 to-spiritual-light/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-spiritual-lavender/40 p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mb-4 flex justify-center">
              <Image
                src="/images/logo.png?v=2"
                alt="スピチャ"
                width={200}
                height={70}
                className="w-auto h-12 md:h-14"
                priority
              />
            </div>
          </div>

          {/* プログレスバー */}
          <ProgressBar currentStep={currentStep} totalSteps={3} />

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/50 rounded-xl text-red-200 text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* ============ Step 1: 基本情報 ============ */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    まずは基本情報を教えてください
                  </h2>
                  <p className="text-sm text-spiritual-lavender">
                    占い師があなたに合った鑑定をするために必要な情報です
                  </p>
                </div>

                {/* Nickname */}
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-200 mb-2">
                    ニックネーム
                  </label>
                  <input
                    id="nickname"
                    type="text"
                    {...register('nickname')}
                    className="w-full px-4 py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[48px]"
                    placeholder="例：さくら"
                  />
                  {errors.nickname && (
                    <p className="mt-1 text-sm text-red-300">{errors.nickname.message}</p>
                  )}
                  <p className="mt-1 text-xs text-spiritual-lavender">本名でなくてOKです</p>
                </div>

                {/* Birth Date */}
                <div>
                  <label htmlFor="birthDate" className="block text-sm font-medium text-gray-200 mb-2">
                    生年月日
                  </label>
                  <input
                    id="birthDate"
                    type="date"
                    {...register('birthDate')}
                    className="w-full px-4 py-3.5 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm text-base min-h-[48px]"
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-300">{errors.birthDate.message}</p>
                  )}
                  <p className="mt-1 text-xs text-spiritual-lavender">星座や運命数の算出に使用します</p>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">
                    性別
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'female', label: '女性' },
                      { value: 'male', label: '男性' },
                      { value: 'other', label: 'その他' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center justify-center px-4 py-3.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 backdrop-blur-sm min-h-[48px]"
                      >
                        <input
                          type="radio"
                          value={option.value}
                          {...register('gender')}
                          className="sr-only"
                        />
                        <span className="text-base font-medium text-gray-200">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-300">{errors.gender.message}</p>
                  )}
                </div>

                {/* 次へボタン */}
                <button
                  type="button"
                  onClick={nextStep}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-spiritual-gold/50 transition-all duration-300 text-lg min-h-[56px] active:scale-[0.98]"
                >
                  次へ進む
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* ============ Step 2: お悩み情報 ============ */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    どんなことでお悩みですか？
                  </h2>
                  <p className="text-sm text-spiritual-lavender">
                    カテゴリを選んで、お悩みを教えてください
                  </p>
                </div>

                {/* Concern Category - カードUI */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-3">
                    お悩みのカテゴリ
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                    {concernCategories.map((category) => {
                      const config = categoryConfig[category]
                      const isSelected = concernCategory === category
                      return (
                        <label
                          key={category}
                          className={`relative flex flex-col items-center justify-center p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-spiritual-gold bg-spiritual-gold/20 shadow-lg shadow-spiritual-gold/30'
                              : 'border-spiritual-lavender/40 bg-spiritual-dark/30 hover:border-spiritual-gold/60 hover:bg-spiritual-gold/10'
                          }`}
                        >
                          <input
                            type="radio"
                            value={category}
                            {...register('concernCategory')}
                            className="sr-only"
                            onChange={() => {
                              setSelectedTemplate(null)
                              setValue('concernDescription', '')
                            }}
                          />
                          <div className={`${config.bgColor} p-2 rounded-full mb-2`}>
                            <div className={config.color}>{config.icon}</div>
                          </div>
                          <span className="text-sm font-medium text-gray-200">{category}</span>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-spiritual-gold rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-spiritual-dark" />
                            </div>
                          )}
                        </label>
                      )
                    })}
                  </div>
                  {errors.concernCategory && (
                    <p className="mt-2 text-sm text-red-300">{errors.concernCategory.message}</p>
                  )}
                </div>

                {/* テンプレート選択（カテゴリ選択後に表示） */}
                {concernCategory && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <label className="block text-sm font-medium text-gray-200 mb-3">
                      よくあるお悩み（タップで入力）
                    </label>
                    <div className="space-y-2">
                      {concernTemplates[concernCategory]?.map((template, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedTemplate === template
                              ? 'border-spiritual-gold bg-spiritual-gold/20'
                              : 'border-spiritual-lavender/30 bg-spiritual-dark/30 hover:border-spiritual-gold/50'
                          }`}
                        >
                          <p className="text-sm text-gray-200 line-clamp-2">{template}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concern Description */}
                <div>
                  <label htmlFor="concernDescription" className="block text-sm font-medium text-gray-200 mb-2">
                    お悩みの内容
                  </label>
                  <p className="text-xs text-spiritual-gold/90 mb-2">
                    上のテンプレートを編集したり、自由に書いてもOKです
                  </p>
                  <textarea
                    id="concernDescription"
                    {...register('concernDescription')}
                    rows={5}
                    maxLength={1000}
                    className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 focus:border-spiritual-gold/60 transition-all backdrop-blur-sm resize-none text-base"
                    placeholder="あなたのお悩みを教えてください"
                  />
                  {errors.concernDescription && (
                    <p className="mt-1 text-sm text-red-300">{errors.concernDescription.message}</p>
                  )}
                  <div className="mt-1 flex justify-between text-xs">
                    <span className="text-spiritual-lavender">
                      短くてもOK！後から詳しく伝えられます
                    </span>
                    <span className="text-spiritual-lavender">
                      {concernDescription?.length || 0} / 1000文字
                    </span>
                  </div>
                </div>

                {/* ボタン */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-6 py-4 bg-spiritual-dark/50 border border-spiritual-lavender/40 text-gray-200 font-medium rounded-xl hover:bg-spiritual-dark/70 transition-all min-h-[56px]"
                  >
                    戻る
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-spiritual-gold/50 transition-all duration-300 text-lg min-h-[56px] active:scale-[0.98]"
                  >
                    次へ進む
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* ============ Step 3: 完了 + 任意情報 ============ */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-spiritual-gold to-spiritual-accent mb-4">
                    <Sparkles className="w-8 h-8 text-spiritual-dark" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    あと少しで完了です！
                  </h2>
                  <p className="text-sm text-spiritual-lavender">
                    占い師があなたを待っています
                  </p>
                </div>

                {/* 占い師プレビュー */}
                {fortuneTellers.length > 0 && (
                  <div className="bg-spiritual-dark/40 rounded-2xl p-4 border border-spiritual-lavender/30">
                    <p className="text-center text-sm text-spiritual-gold mb-3">
                      <Star className="w-4 h-4 inline-block mr-1" />
                      人気の占い師
                    </p>
                    <div className="flex justify-center gap-4">
                      {fortuneTellers.map((ft) => (
                        <div key={ft.id} className="flex flex-col items-center">
                          <div className="relative">
                            <Image
                              src={ft.avatar_url || '/images/default-avatar.png'}
                              alt={ft.name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-full border-2 border-spiritual-gold/50 object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-spiritual-dark flex items-center justify-center">
                              <MessageCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <span className="mt-2 text-sm font-medium text-gray-200">{ft.name}</span>
                          <span className="text-xs text-spiritual-lavender">{ft.specialty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 任意情報（折りたたみ） */}
                <div className="border border-spiritual-lavender/30 rounded-2xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowOptionalInfo(!showOptionalInfo)}
                    className="w-full flex items-center justify-between p-4 bg-spiritual-dark/30 hover:bg-spiritual-dark/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-gray-200">
                        より詳しい鑑定のために（任意）
                      </span>
                      <span className="px-2 py-0.5 bg-spiritual-lavender/30 rounded text-xs text-spiritual-lavender">
                        後から変更可能
                      </span>
                    </div>
                    {showOptionalInfo ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {showOptionalInfo && (
                    <div className="p-4 space-y-5 bg-spiritual-dark/20 animate-in fade-in slide-in-from-top-4 duration-300">
                      {/* 出生情報 */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-spiritual-gold">出生情報</h3>

                        {/* Birth Time */}
                        <div>
                          <label htmlFor="birthTime" className="block text-sm text-gray-300 mb-1">
                            出生時刻
                          </label>
                          <input
                            id="birthTime"
                            type="time"
                            {...register('birthTime')}
                            className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 transition-all text-base min-h-[44px]"
                          />
                          <p className="mt-1 text-xs text-spiritual-lavender">母子手帳で確認できる場合</p>
                        </div>

                        {/* Prefecture */}
                        <div>
                          <label htmlFor="birthPlace" className="block text-sm text-gray-300 mb-1">
                            現在住んでいる都道府県
                          </label>
                          <select
                            id="birthPlace"
                            {...register('birthPlace')}
                            className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 transition-all text-base min-h-[44px]"
                          >
                            <option value="" className="bg-spiritual-dark">選択してください</option>
                            {PREFECTURES.map((pref) => (
                              <option key={pref} value={pref} className="bg-spiritual-dark">{pref}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* お相手情報（恋愛系カテゴリの場合に表示） */}
                      {isLoveCategory && (
                        <div className="space-y-4 pt-4 border-t border-spiritual-lavender/20">
                          <h3 className="text-sm font-medium text-spiritual-gold">お相手の情報</h3>

                          {/* Partner Name */}
                          <div>
                            <label htmlFor="partnerName" className="block text-sm text-gray-300 mb-1">
                              お相手の名前（ニックネーム可）
                            </label>
                            <input
                              id="partnerName"
                              type="text"
                              {...register('partnerName')}
                              className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 transition-all text-base min-h-[44px]"
                              placeholder="例：たろう"
                            />
                          </div>

                          {/* Partner Gender */}
                          <div>
                            <label className="block text-sm text-gray-300 mb-1">
                              お相手の性別
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { value: 'male', label: '男性' },
                                { value: 'female', label: '女性' },
                                { value: 'other', label: 'その他' },
                              ].map((option) => (
                                <label
                                  key={option.value}
                                  className="flex items-center justify-center px-3 py-2.5 border-2 border-spiritual-lavender/40 bg-spiritual-dark/30 rounded-xl cursor-pointer hover:border-spiritual-gold/60 transition-all has-[:checked]:border-spiritual-gold has-[:checked]:bg-spiritual-gold/20 min-h-[40px]"
                                >
                                  <input
                                    type="radio"
                                    value={option.value}
                                    {...register('partnerGender')}
                                    className="sr-only"
                                  />
                                  <span className="text-sm font-medium text-gray-200">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Partner Birth Date or Age */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <label className="text-sm text-gray-300">
                                お相手の生年月日・年齢
                              </label>
                              <button
                                type="button"
                                onClick={() => setUsePartnerAge(!usePartnerAge)}
                                className="text-xs text-spiritual-gold hover:text-spiritual-accent underline"
                              >
                                {usePartnerAge ? '生年月日で入力' : '年齢で入力'}
                              </button>
                            </div>

                            {!usePartnerAge ? (
                              <input
                                type="date"
                                {...register('partnerBirthDate')}
                                className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 transition-all text-base min-h-[44px]"
                              />
                            ) : (
                              <select
                                {...register('partnerAge', { valueAsNumber: true })}
                                className="w-full px-4 py-3 bg-spiritual-dark/50 border border-spiritual-lavender/40 rounded-xl text-gray-100 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 transition-all text-base min-h-[44px]"
                              >
                                <option value="" className="bg-spiritual-dark">大体の年齢を選択</option>
                                {AGE_OPTIONS.map((age) => (
                                  <option key={age} value={age} className="bg-spiritual-dark">{age}歳</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 注意書き */}
                <div className="text-center">
                  <p className="text-xs text-spiritual-lavender">
                    登録した情報は<span className="text-spiritual-gold">いつでもマイページから変更</span>できます
                  </p>
                </div>

                {/* ボタン */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 px-6 py-4 bg-spiritual-dark/50 border border-spiritual-lavender/40 text-gray-200 font-medium rounded-xl hover:bg-spiritual-dark/70 transition-all min-h-[56px]"
                  >
                    戻る
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark font-bold rounded-xl shadow-xl hover:shadow-2xl hover:shadow-spiritual-gold/50 focus:outline-none focus:ring-2 focus:ring-spiritual-gold/60 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg min-h-[56px] active:scale-[0.98] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-spiritual-gold to-spiritual-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-spiritual-dark/30 border-t-spiritual-dark rounded-full animate-spin" />
                          <span>登録中...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>占い師を選ぶ</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-xs text-spiritual-lavender">
          入力された情報は、より精度の高い鑑定のためにのみ使用されます
        </p>
      </div>
    </div>
  )
}
