import { Metadata } from 'next'
import HoroscopeListClient from './HoroscopeListClient'

export const metadata: Metadata = {
  title: '今日の運勢 | 12星座ランキング',
  description: '人気占い師監修AIによる今日の12星座運勢ランキング。恋愛運・仕事運・金運を毎日無料で占います。あなたの星座は何位？',
}

export default function HoroscopePage() {
  return <HoroscopeListClient />
}
