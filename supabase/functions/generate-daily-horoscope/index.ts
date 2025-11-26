import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface HoroscopeData {
  zodiac_sign_id: string
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

const ZODIAC_SIGNS = [
  { id: 'aries', name: '牡羊座' },
  { id: 'taurus', name: '牡牛座' },
  { id: 'gemini', name: '双子座' },
  { id: 'cancer', name: '蟹座' },
  { id: 'leo', name: '獅子座' },
  { id: 'virgo', name: '乙女座' },
  { id: 'libra', name: '天秤座' },
  { id: 'scorpio', name: '蠍座' },
  { id: 'sagittarius', name: '射手座' },
  { id: 'capricorn', name: '山羊座' },
  { id: 'aquarius', name: '水瓶座' },
  { id: 'pisces', name: '魚座' },
]

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 今日の日付を取得（JST）
    const today = new Date()
    const jstDate = new Date(today.getTime() + 9 * 60 * 60 * 1000)
    const dateStr = jstDate.toISOString().split('T')[0]

    console.log(`Generating horoscope for ${dateStr}`)

    // すでに今日の運勢が存在するかチェック
    const { data: existing } = await supabase
      .from('horoscope_posts')
      .select('id')
      .eq('post_date', dateStr)
      .limit(1)

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ message: 'Today\'s horoscope already exists' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Gemini APIで12星座分の運勢を一括生成（API料金節約）
    const prompt = `あなたは人気占い師です。${dateStr}の12星座の運勢を占ってください。

以下の12星座すべてについて、JSON形式で出力してください：
${ZODIAC_SIGNS.map((s) => s.name).join('、')}

各星座について以下の情報を含めてください：
- overall_rating: 総合運（1-5の整数）
- overall_text: 総合運の説明（80-120文字、前向きで優しい口調）
- love_rating: 恋愛運（1-5の整数）
- love_text: 恋愛運の説明（80-120文字、片思い・既婚者両方にアドバイス）
- work_rating: 仕事運（1-5の整数）
- work_text: 仕事運の説明（80-120文字、具体的なアドバイス）
- money_rating: 金運（1-5の整数）
- money_text: 金運の説明（80-120文字、お金の使い方アドバイス）
- lucky_color: ラッキーカラー（日本語で1単語）
- lucky_item: ラッキーアイテム（日本語で1-2単語）
- lucky_direction: ラッキー方角（東西南北のいずれか）

出力形式は以下のJSON配列にしてください：
[
  {
    "zodiac": "aries",
    "overall_rating": 4,
    "overall_text": "...",
    "love_rating": 5,
    "love_text": "...",
    "work_rating": 3,
    "work_text": "...",
    "money_rating": 4,
    "money_text": "...",
    "lucky_color": "ピンク",
    "lucky_item": "ハンカチ",
    "lucky_direction": "南"
  },
  ...
]

重要：
1. 必ずJSON配列だけを出力してください（説明文は不要）
2. 文章は前向きで温かみのある表現にしてください
3. 各星座で異なる内容にしてください`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 8000,
          },
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    // JSONを抽出（マークダウンのコードブロックを除去）
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response')
    }

    const horoscopes = JSON.parse(jsonMatch[0])

    // データベースに保存
    const insertData: HoroscopeData[] = horoscopes.map((h: any) => ({
      zodiac_sign_id: h.zodiac,
      post_date: dateStr,
      overall_rating: h.overall_rating,
      overall_text: h.overall_text,
      love_rating: h.love_rating,
      love_text: h.love_text,
      work_rating: h.work_rating,
      work_text: h.work_text,
      money_rating: h.money_rating,
      money_text: h.money_text,
      lucky_color: h.lucky_color,
      lucky_item: h.lucky_item,
      lucky_direction: h.lucky_direction,
    }))

    const { error } = await supabase.from('horoscope_posts').insert(insertData)

    if (error) {
      throw error
    }

    console.log(`Successfully generated horoscope for ${dateStr}`)

    return new Response(
      JSON.stringify({
        success: true,
        date: dateStr,
        count: insertData.length,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: '運勢生成に失敗しました' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
