'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ZODIAC_SIGNS, getRatingStars } from '@/lib/data/zodiac-signs'
import { Calendar, Trophy, Sparkles, ArrowRight } from 'lucide-react'

interface HoroscopeData {
  zodiac_sign_id: string
  overall_rating: number
  overall_text: string
  post_date: string
}

export default function HoroscopeListClient() {
  const router = useRouter()
  const [horoscopes, setHoroscopes] = useState<HoroscopeData[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadHoroscopes()
  }, [selectedDate])

  const loadHoroscopes = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // 日付が指定されていない場合は今日の日付を使用
    const targetDate = selectedDate || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('horoscope_posts')
      .select('zodiac_sign_id, overall_rating, overall_text, post_date')
      .eq('post_date', targetDate)
      .order('overall_rating', { ascending: false })

    if (data) {
      setHoroscopes(data)
    }

    setIsLoading(false)
  }

  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })
    : new Date().toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      })

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `${rank}位`
  }

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        backgroundImage: 'url(/images/BackGround.jpeg)',
        backgroundSize: 'auto',
        backgroundPosition: 'center top',
        backgroundRepeat: 'repeat',
      }}
    >
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark py-6 px-4 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-7 h-7" />
                今日の運勢ランキング
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-sm mt-1">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* 日付選択 */}
          <input
            type="date"
            value={selectedDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full md:w-auto px-4 py-2 rounded-lg bg-white/95 text-gray-900 font-semibold"
          />
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-pink mx-auto"></div>
            <p className="mt-4 text-white">読み込み中...</p>
          </div>
        ) : horoscopes.length === 0 ? (
          <div className="bg-white/90 rounded-2xl p-8 text-center shadow-lg">
            <p className="text-gray-700 text-lg">
              この日の運勢はまだ生成されていません
            </p>
          </div>
        ) : (
          <>
            {/* ランキングリスト */}
            <div className="space-y-4 mb-8">
              {horoscopes.map((horoscope, index) => {
                const zodiac = ZODIAC_SIGNS.find((z) => z.id === horoscope.zodiac_sign_id)
                if (!zodiac) return null

                const rank = index + 1
                const isTopThree = rank <= 3

                return (
                  <div
                    key={horoscope.zodiac_sign_id}
                    onClick={() =>
                      router.push(
                        `/horoscope/${horoscope.zodiac_sign_id}/${horoscope.post_date}`
                      )
                    }
                    className={`bg-gradient-to-r ${
                      isTopThree
                        ? 'from-amber-50/95 to-white/95 border-amber-300/60 shadow-xl'
                        : 'from-white/90 to-pink-50/90 border-gray-200/50 shadow-lg'
                    } backdrop-blur-sm rounded-2xl p-5 cursor-pointer hover:scale-[1.02] transition-all duration-300 border-2`}
                  >
                    <div className="flex items-center gap-4">
                      {/* ランク表示 */}
                      <div
                        className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black text-xl ${
                          isTopThree
                            ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {getRankMedal(rank)}
                      </div>

                      {/* 星座アイコン */}
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-2xl border-3 border-white shadow-md"
                        style={{ backgroundColor: zodiac.color }}
                      >
                        {zodiac.symbol}
                      </div>

                      {/* 星座情報 */}
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-gray-900">
                          {zodiac.nameJa}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600">
                          {zodiac.dateRange}
                        </p>
                        <div className="text-spiritual-gold text-sm md:text-base mt-1">
                          {getRatingStars(horoscope.overall_rating)}
                        </div>
                      </div>

                      {/* 矢印 */}
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>

                    {/* 運勢テキスト（3位までのみ表示） */}
                    {isTopThree && (
                      <p className="text-gray-700 text-sm md:text-base mt-4 leading-relaxed line-clamp-2">
                        {horoscope.overall_text}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* スピチャ登録CTA */}
            <div className="bg-gradient-to-br from-spiritual-pink/20 to-spiritual-purple/20 backdrop-blur-sm rounded-3xl p-6 md:p-10 shadow-2xl border-2 border-spiritual-pink/40">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-spiritual-gold mx-auto mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  あなただけの詳しい運勢を知りたい方は…
                </h2>
                <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
                  人気占い師監修のAIが、あなたの<strong className="text-spiritual-pink-dark">生年月日や悩み</strong>に合わせて<br className="hidden md:block" />
                  パーソナライズされた鑑定結果をお届けします
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-spiritual-gold">✓</span>
                    <span className="font-semibold">恋愛・復縁・片思い</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-spiritual-gold">✓</span>
                    <span className="font-semibold">仕事・転職・人間関係</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <span className="text-spiritual-gold">✓</span>
                    <span className="font-semibold">金運・家庭問題</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full max-w-lg mx-auto block px-8 py-5 bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-gray-900 rounded-full font-black text-xl hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-gold/50"
                >
                  スピチャで本格的に占う
                </button>
                <p className="text-sm text-gray-600 mt-3">
                  ✨ 初回1000pt無料 ／ 完全匿名で安心 ／ 24時間365日対応
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
