import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getZodiacSign, getRatingStars } from '@/lib/data/zodiac-signs'
import HoroscopeDetailClient from './HoroscopeDetailClient'

interface Props {
  params: Promise<{
    zodiacId: string
    date: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zodiacId, date } = await params
  const zodiac = getZodiacSign(zodiacId)

  if (!zodiac) {
    return { title: '運勢が見つかりません' }
  }

  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return {
    title: `${formattedDate}の${zodiac.nameJa}の運勢`,
    description: `${zodiac.nameJa}（${zodiac.dateRange}）の${formattedDate}の運勢。恋愛運・仕事運・金運をAI占い師が無料鑑定。今日のラッキーカラーやラッキーアイテムもチェック！`,
  }
}

export default async function HoroscopePage({ params }: Props) {
  const { zodiacId, date } = await params
  const zodiac = getZodiacSign(zodiacId)

  if (!zodiac) {
    notFound()
  }

  const supabase = await createClient()
  const { data: horoscope, error } = await supabase
    .from('horoscope_posts')
    .select('*')
    .eq('zodiac_sign_id', zodiacId)
    .eq('post_date', date)
    .single()

  if (error || !horoscope) {
    notFound()
  }

  const formattedDate = new Date(date).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })

  return (
    <HoroscopeDetailClient
      zodiac={zodiac}
      horoscope={horoscope}
      formattedDate={formattedDate}
    />
  )
}
