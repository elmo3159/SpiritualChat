import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

interface HoroscopeData {
  zodiac_sign_id: string
  post_date: string
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
  { id: 'aries', name: '牡羊座', element: '火', ruling: '火星', traits: '情熱的で行動力がある' },
  { id: 'taurus', name: '牡牛座', element: '地', ruling: '金星', traits: '安定を求め粘り強い' },
  { id: 'gemini', name: '双子座', element: '風', ruling: '水星', traits: '知的好奇心が旺盛' },
  { id: 'cancer', name: '蟹座', element: '水', ruling: '月', traits: '感受性豊かで家庭的' },
  { id: 'leo', name: '獅子座', element: '火', ruling: '太陽', traits: '華やかでリーダーシップがある' },
  { id: 'virgo', name: '乙女座', element: '地', ruling: '水星', traits: '几帳面で分析力がある' },
  { id: 'libra', name: '天秤座', element: '風', ruling: '金星', traits: '調和を大切にしバランス感覚に優れる' },
  { id: 'scorpio', name: '蠍座', element: '水', ruling: '冥王星', traits: '深い洞察力と集中力を持つ' },
  { id: 'sagittarius', name: '射手座', element: '火', ruling: '木星', traits: '冒険心と楽観性に富む' },
  { id: 'capricorn', name: '山羊座', element: '地', ruling: '土星', traits: '責任感が強く野心的' },
  { id: 'aquarius', name: '水瓶座', element: '風', ruling: '天王星', traits: '独創的で革新的' },
  { id: 'pisces', name: '魚座', element: '水', ruling: '海王星', traits: '直感力と共感力が高い' },
]

const DAILY_THEMES = [
  { theme: '新しい出会い', focus: '人との縁、コミュニケーション、社交運', mood: '期待と興奮' },
  { theme: '内なる成長', focus: '自己啓発、学び、スキルアップ', mood: '静かな決意' },
  { theme: '創造性の開花', focus: '芸術、表現、アイデア', mood: 'インスピレーション' },
  { theme: '心の安らぎ', focus: '癒し、休息、心身のバランス', mood: '穏やかさ' },
  { theme: '情熱の炎', focus: '挑戦、目標達成、モチベーション', mood: '熱意' },
  { theme: '豊かさの循環', focus: '金運、収入、投資', mood: '繁栄への期待' },
  { theme: '愛の深まり', focus: '恋愛、パートナーシップ、家族愛', mood: '温かさ' },
  { theme: '直感の冴え', focus: 'スピリチュアル、第六感、夢からのメッセージ', mood: '神秘的' },
  { theme: '変化の波', focus: '転機、決断、新たなスタート', mood: '勇気' },
  { theme: '調和とバランス', focus: '人間関係の修復、協調性、平和', mood: '穏やかな幸せ' },
  { theme: '自信の輝き', focus: '自己肯定感、魅力アップ、リーダーシップ', mood: '誇らしさ' },
  { theme: '幸運の扉', focus: 'チャンス到来、運命的な出来事', mood: 'ワクワク' },
  { theme: '癒しと浄化', focus: 'デトックス、手放し、過去からの解放', mood: '清々しさ' },
  { theme: '知恵の光', focus: '問題解決、洞察、学問', mood: '冷静さ' },
  { theme: '冒険の始まり', focus: '旅行運、新体験、視野の拡大', mood: '開放感' },
]

const DAY_OF_WEEK_FOCUS = [
  { day: '日曜日', energy: '太陽のエネルギー', focus: '自己表現と創造性、家族との時間', advice: '自分らしさを大切に' },
  { day: '月曜日', energy: '月のエネルギー', focus: '感情と直感、新しい週のスタート', advice: '心の声に耳を傾けて' },
  { day: '火曜日', energy: '火星のエネルギー', focus: '行動力と勇気、競争心', advice: '積極的にチャレンジを' },
  { day: '水曜日', energy: '水星のエネルギー', focus: 'コミュニケーションと学び', advice: '情報収集と対話を大切に' },
  { day: '木曜日', energy: '木星のエネルギー', focus: '拡大と発展、幸運', advice: '大きな視野で物事を見て' },
  { day: '金曜日', energy: '金星のエネルギー', focus: '愛と美、人間関係', advice: '美しいものに触れる時間を' },
  { day: '土曜日', energy: '土星のエネルギー', focus: '責任と構築、振り返り', advice: '地に足をつけて着実に' },
]

function getSpecialEvent(month: number, day: number): string | null {
  const events: Record<string, string> = {
    '1-1': '新年の始まり。今年一年の運気を左右する大切な日',
    '2-3': '節分。邪気を払い、新たな運気を招き入れる日',
    '2-14': 'バレンタインデー。愛のエネルギーが高まる特別な日',
    '3-3': 'ひな祭り。女性性と美のエネルギーが高まる日',
    '3-20': '春分の日。昼と夜が等しくなり、宇宙のバランスが整う日',
    '5-5': '端午の節句。力強いエネルギーに満ちる日',
    '6-21': '夏至。太陽のエネルギーが最も強まる日',
    '7-7': '七夕。願いが届きやすい特別な日',
    '8-15': 'お盆。ご先祖様との繋がりが深まる日',
    '9-23': '秋分の日。収穫と感謝のエネルギーに満ちる日',
    '10-31': 'ハロウィン。霊的なエネルギーが活発になる日',
    '11-22': 'いい夫婦の日。パートナーシップ運が高まる日',
    '12-21': '冬至。陰のエネルギーが極まり、陽に転じる日',
    '12-25': 'クリスマス。愛と奇跡のエネルギーが満ちる日',
    '12-31': '大晦日。一年の集大成と浄化の日',
  }
  return events[`${month}-${day}`] || null
}

function getMoonPhase(date: Date): { phase: string; influence: string } {
  const lunarCycle = 29.530588853
  const baseNewMoon = new Date(2000, 0, 6).getTime()
  const diff = date.getTime() - baseNewMoon
  const daysSinceNewMoon = diff / (1000 * 60 * 60 * 24)
  const currentCycle = daysSinceNewMoon % lunarCycle
  const phase = currentCycle / lunarCycle

  if (phase < 0.03 || phase > 0.97) {
    return { phase: '新月', influence: '新しい始まりに最適な時期。願い事を立てると叶いやすい' }
  } else if (phase < 0.22) {
    return { phase: '三日月', influence: '成長のエネルギー。新しいことを始めるのに良い時期' }
  } else if (phase < 0.28) {
    return { phase: '上弦の月', influence: '行動と決断の時期。積極的に動くと吉' }
  } else if (phase < 0.47) {
    return { phase: '十三夜月', influence: 'エネルギーが高まる時期。目標に向かって前進を' }
  } else if (phase < 0.53) {
    return { phase: '満月', influence: '達成と完成の時。感謝を捧げ、成果を受け取る時期' }
  } else if (phase < 0.72) {
    return { phase: '十六夜月', influence: '分かち合いの時期。人との絆を深めると吉' }
  } else if (phase < 0.78) {
    return { phase: '下弦の月', influence: '手放しと浄化の時期。不要なものを整理すると吉' }
  } else {
    return { phase: '二十六夜月', influence: '内省と休息の時期。心身を整えることが大切' }
  }
}

function getDailySeed(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return (year * 10000 + month * 100 + day) % DAILY_THEMES.length
}

export async function POST(req: NextRequest) {
  try {
    // 管理者認証チェック（簡易版）
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET_KEY}`) {
      // 開発環境では許可
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

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
      return NextResponse.json({ message: 'Today\'s horoscope already exists', date: dateStr })
    }

    // 日替わり要素を計算
    const dayOfWeek = jstDate.getDay()
    const dayInfo = DAY_OF_WEEK_FOCUS[dayOfWeek]
    const dailySeed = getDailySeed(jstDate)
    const dailyTheme = DAILY_THEMES[dailySeed]
    const moonPhase = getMoonPhase(jstDate)
    const month = jstDate.getMonth() + 1
    const day = jstDate.getDate()
    const specialEvent = getSpecialEvent(month, day)

    let season = ''
    if (month >= 3 && month <= 5) season = '春'
    else if (month >= 6 && month <= 8) season = '夏'
    else if (month >= 9 && month <= 11) season = '秋'
    else season = '冬'

    const zodiacDetails = ZODIAC_SIGNS.map(
      (s) => `${s.name}（${s.id}）: 属性=${s.element}、支配星=${s.ruling}、特性=${s.traits}`
    ).join('\n')

    const prompt = `あなたは20年以上の経験を持つ、日本で最も人気のある占い師です。
温かく包み込むような語り口で、読者一人ひとりに寄り添った占いをお願いします。

■ 本日の日付：${dateStr}（${dayInfo.day}）
■ 季節：${season}
■ 月の満ち欠け：${moonPhase.phase}
  └ ${moonPhase.influence}
■ 今日の宇宙のテーマ：「${dailyTheme.theme}」
  └ フォーカス：${dailyTheme.focus}
  └ 全体のムード：${dailyTheme.mood}
■ 曜日のエネルギー：${dayInfo.energy}
  └ ${dayInfo.focus}
  └ アドバイス：${dayInfo.advice}
${specialEvent ? `■ 特別な日：${specialEvent}` : ''}

【各星座の特性】
${zodiacDetails}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
上記の宇宙の流れ・テーマ・月のエネルギーを踏まえて、
12星座それぞれに対して、今日一日の詳細な運勢を占ってください。
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【重要な指示】
1. 各星座の「属性（火・地・風・水）」と「支配星」を考慮してください
2. 今日のテーマ「${dailyTheme.theme}」が各星座にどう影響するか、星座ごとに異なる解釈をしてください
3. ${moonPhase.phase}の影響を具体的に織り込んでください
4. ${dayInfo.day}の${dayInfo.energy}との相性を考慮してください
5. 文章は「です・ます調」で、読者に語りかけるように書いてください
6. 抽象的な表現だけでなく、「午前中に」「夕方以降」「人混みで」など具体的なシチュエーションを入れてください
7. ネガティブな内容でも、必ず前向きなアドバイスや希望を添えてください

【各項目の文字数目安】
- overall_text（総合運）：180〜250文字
  → 今日一日の全体的な流れ、気をつけるべきこと、開運アクションを含める
- love_text（恋愛運）：150〜200文字
  → 片思いの人向け、カップル向け、既婚者向けのいずれかの視点を織り交ぜる
- work_text（仕事運）：150〜200文字
  → 職場での人間関係、業務効率、キャリアアップのヒントを含める
- money_text（金運）：120〜180文字
  → 収入・支出・投資・お金の使い方についてアドバイス

【出力形式】以下のJSON配列のみを出力してください：
[
  {
    "zodiac": "aries",
    "overall_rating": 1〜5の整数,
    "overall_text": "総合運の詳細な説明文...",
    "love_rating": 1〜5の整数,
    "love_text": "恋愛運の詳細な説明文...",
    "work_rating": 1〜5の整数,
    "work_text": "仕事運の詳細な説明文...",
    "money_rating": 1〜5の整数,
    "money_text": "金運の詳細な説明文...",
    "lucky_color": "ラッキーカラー（日本語）",
    "lucky_item": "ラッキーアイテム（具体的に）",
    "lucky_direction": "東/西/南/北/東南/南西/北西/北東のいずれか"
  },
  ... 残り11星座も同様に
]

【絶対に守ること】
- JSON配列のみを出力（説明文や装飾は不要）
- 12星座すべてを必ず含める
- 各星座で内容が重複しないよう、バリエーションを持たせる
- ラッキーアイテムは具体的に（例：「白いハンカチ」「レモン風味のお菓子」「木製のアクセサリー」）`

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 1.0,
            maxOutputTokens: 16000,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    const generatedText = data.candidates[0].content.parts[0].text

    const jsonMatch = generatedText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Gemini response')
    }

    const horoscopes = JSON.parse(jsonMatch[0])

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

    return NextResponse.json({
      success: true,
      date: dateStr,
      count: insertData.length,
      theme: dailyTheme.theme,
      moonPhase: moonPhase.phase,
    })
  } catch (error) {
    console.error('Error generating horoscope:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '運勢生成に失敗しました' },
      { status: 500 }
    )
  }
}
