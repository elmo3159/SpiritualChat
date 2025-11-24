'use client'

import { useRouter } from 'next/navigation'
import { Heart, Briefcase, DollarSign, Sparkles, ArrowLeft, Calendar } from 'lucide-react'
import { ZodiacSign, getRatingStars } from '@/lib/data/zodiac-signs'

interface HoroscopePost {
  overall_rating: number
  overall_text: string
  love_rating: number
  love_text: string
  work_rating: number
  work_text: string
  money_rating: number
  money_text: string
  lucky_color: string
  lucky_item: string
  lucky_direction: string
}

interface Props {
  zodiac: ZodiacSign
  horoscope: HoroscopePost
  formattedDate: string
}

export default function HoroscopeDetailClient({ zodiac, horoscope, formattedDate }: Props) {
  const router = useRouter()

  return (
    <div className="min-h-screen" style={{
      backgroundImage: 'url(/images/BackGround.jpeg)',
      backgroundSize: 'auto',
      backgroundPosition: 'center top',
      backgroundRepeat: 'repeat',
    }}>
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark py-4 px-4 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-white/80 transition-colors mb-3"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-lg"
              style={{ backgroundColor: zodiac.color }}
            >
              {zodiac.symbol}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {zodiac.nameJa}の運勢
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* 総合運 */}
        <div className="bg-gradient-to-br from-white/95 to-pink-50/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl mb-6 border-2 border-spiritual-pink/30">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-7 h-7 text-spiritual-gold" />
            <h2 className="text-2xl font-bold text-gray-900">総合運</h2>
          </div>
          <div className="text-3xl text-spiritual-gold mb-3">
            {getRatingStars(horoscope.overall_rating)}
          </div>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            {horoscope.overall_text}
          </p>
        </div>

        {/* 恋愛運 */}
        <div className="bg-gradient-to-br from-pink-50/95 to-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl mb-6 border-2 border-pink-300/50">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-7 h-7 text-spiritual-pink" />
            <h2 className="text-2xl font-bold text-gray-900">恋愛運</h2>
          </div>
          <div className="text-3xl text-spiritual-pink mb-3">
            {getRatingStars(horoscope.love_rating)}
          </div>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            {horoscope.love_text}
          </p>
        </div>

        {/* スピチャ登録CTA（恋愛運の後） */}
        <div className="bg-gradient-to-r from-spiritual-gold/20 to-spiritual-accent/20 backdrop-blur-sm rounded-2xl p-6 md:p-8 mb-6 border-2 border-spiritual-gold/40 shadow-lg">
          <div className="text-center">
            <p className="text-gray-800 font-semibold text-lg mb-4">
              💝 もっと詳しく恋愛運を占いたい方へ
            </p>
            <p className="text-gray-700 mb-5 text-sm md:text-base">
              人気占い師監修のAIがあなただけの<strong className="text-spiritual-pink-dark">恋愛アドバイス</strong>を提供します。<br />
              片思い・復縁・相手の気持ち…何でも相談OK！
            </p>
            <button
              onClick={() => router.push('/signup')}
              className="w-full max-w-md mx-auto block px-6 py-4 bg-gradient-to-r from-spiritual-pink to-spiritual-pink-dark text-white rounded-full font-bold text-lg hover:scale-105 transition-transform duration-300 shadow-xl"
            >
              今すぐ無料で占う
            </button>
            <p className="text-xs text-gray-600 mt-2">
              ✨ 初回1000pt無料 ／ 24時間いつでも相談OK
            </p>
          </div>
        </div>

        {/* 仕事運 */}
        <div className="bg-gradient-to-br from-amber-50/95 to-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl mb-6 border-2 border-amber-300/50">
          <div className="flex items-center gap-3 mb-4">
            <Briefcase className="w-7 h-7 text-amber-700" />
            <h2 className="text-2xl font-bold text-gray-900">仕事運</h2>
          </div>
          <div className="text-3xl text-amber-600 mb-3">
            {getRatingStars(horoscope.work_rating)}
          </div>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            {horoscope.work_text}
          </p>
        </div>

        {/* 金運 */}
        <div className="bg-gradient-to-br from-green-50/95 to-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl mb-6 border-2 border-green-300/50">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-7 h-7 text-green-700" />
            <h2 className="text-2xl font-bold text-gray-900">金運</h2>
          </div>
          <div className="text-3xl text-green-600 mb-3">
            {getRatingStars(horoscope.money_rating)}
          </div>
          <p className="text-gray-700 leading-relaxed text-base md:text-lg">
            {horoscope.money_text}
          </p>
        </div>

        {/* ラッキーアイテム */}
        <div className="bg-gradient-to-br from-purple-50/95 to-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl mb-6 border-2 border-purple-300/50">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            ✨ 今日のラッキーアイテム
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">ラッキーカラー</div>
              <div className="text-xl font-bold text-spiritual-pink">
                {horoscope.lucky_color}
              </div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">ラッキーアイテム</div>
              <div className="text-xl font-bold text-spiritual-pink">
                {horoscope.lucky_item}
              </div>
            </div>
            <div className="bg-white/80 rounded-xl p-4 text-center">
              <div className="text-sm text-gray-600 mb-1">ラッキー方角</div>
              <div className="text-xl font-bold text-spiritual-pink">
                {horoscope.lucky_direction}
              </div>
            </div>
          </div>
        </div>

        {/* 最終CTA */}
        <div className="bg-gradient-to-br from-spiritual-pink/20 to-spiritual-purple/20 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-2xl border-2 border-spiritual-pink/40">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              もっと詳しく占いたい方は…
            </h3>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed mb-6">
              人気スピリチュアル占い師監修のAIが、<br className="hidden md:block" />
              あなたの<strong className="text-spiritual-pink-dark">悩みに寄り添って</strong>個別にアドバイスします。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-5">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-spiritual-gold">✓</span>
                <span className="font-semibold">24時間365日対応</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-spiritual-gold">✓</span>
                <span className="font-semibold">完全匿名で安心</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-spiritual-gold">✓</span>
                <span className="font-semibold">初回1000pt無料</span>
              </div>
            </div>
            <button
              onClick={() => router.push('/signup')}
              className="w-full max-w-lg mx-auto block px-8 py-5 bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-gray-900 rounded-full font-black text-xl hover:scale-105 transition-transform duration-300 shadow-2xl shadow-spiritual-gold/50"
            >
              スピチャで詳しく占う
            </button>
            <p className="text-sm text-gray-600 mt-3">
              登録後すぐに占い結果が見れます
            </p>
          </div>
        </div>

        {/* 他の星座へのリンク */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/horoscope')}
            className="text-spiritual-pink-light hover:text-spiritual-pink-dark font-semibold transition-colors underline"
          >
            他の星座の運勢を見る →
          </button>
        </div>
      </div>
    </div>
  )
}
