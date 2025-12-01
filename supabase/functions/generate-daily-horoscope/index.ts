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

// 各星座に固有のシチュエーション（毎日ローテーション）
const ZODIAC_DAILY_SCENES = [
  // パターン0
  {
    aries: '朝の通勤・通学時に', taurus: '昼食を選ぶとき', gemini: 'SNSを見ているとき',
    cancer: '家族と話しているとき', leo: '鏡を見た瞬間', virgo: '机の上を整理するとき',
    libra: '友達からの連絡で', scorpio: 'ふと一人になったとき', sagittarius: '新しい情報を見つけたとき',
    capricorn: 'ToDoリストを確認するとき', aquarius: 'いつもと違う道を通ったとき', pisces: '音楽を聴いているとき'
  },
  // パターン1
  {
    aries: '誰かと意見が分かれたとき', taurus: 'お気に入りの場所で', gemini: '面白い話を聞いたとき',
    cancer: '懐かしい写真を見たとき', leo: '人前に出る場面で', virgo: '数字やデータを見るとき',
    libra: '二つの選択肢で迷ったとき', scorpio: '本音を言いたくなったとき', sagittarius: '予定が急に空いたとき',
    capricorn: '上司や先輩と話すとき', aquarius: '常識を疑問に思ったとき', pisces: 'ぼーっとしている時間に'
  },
  // パターン2
  {
    aries: '体を動かしたくなったとき', taurus: '美味しいものを食べるとき', gemini: '電話やメールをするとき',
    cancer: 'ペットや植物を見たとき', leo: '褒められる場面で', virgo: '細かい作業をするとき',
    libra: 'おしゃれを楽しむとき', scorpio: '秘密を知ったとき', sagittarius: '遠出の予定を立てるとき',
    capricorn: '目標を考えるとき', aquarius: 'ネットで調べ物をするとき', pisces: '夢を思い出したとき'
  },
  // パターン3
  {
    aries: '待つのが辛くなったとき', taurus: 'ゆっくり過ごせる時間に', gemini: '複数の予定が重なったとき',
    cancer: '誰かの相談に乗るとき', leo: '自分の意見を求められたとき', virgo: '健康を意識するとき',
    libra: '人間関係のバランスを考えるとき', scorpio: '集中して取り組むとき', sagittarius: '海外のニュースを見たとき',
    capricorn: '将来のことを考えるとき', aquarius: '新しい技術に触れたとき', pisces: 'アートや映画を見たとき'
  },
  // パターン4
  {
    aries: '競争心が芽生えたとき', taurus: '買い物をするとき', gemini: '噂話を耳にしたとき',
    cancer: '手料理を作るとき', leo: 'リーダー役を任されたとき', virgo: '計画を立てるとき',
    libra: '誰かと一緒にいるとき', scorpio: '真実を知りたくなったとき', sagittarius: '笑いが止まらないとき',
    capricorn: '評価されるとき', aquarius: '自分だけの考えを持ったとき', pisces: '誰かを助けたいと思ったとき'
  },
  // パターン5
  {
    aries: '新しいことを始めるとき', taurus: 'のんびりお茶を飲むとき', gemini: '本や記事を読むとき',
    cancer: '実家を思い出すとき', leo: '写真を撮られるとき', virgo: '掃除や整頓をするとき',
    libra: 'デートの予定を立てるとき', scorpio: '人の本心を見抜くとき', sagittarius: '冗談を言いたくなったとき',
    capricorn: 'ルールを確認するとき', aquarius: '発明やアイデアが浮かんだとき', pisces: '空想にふけるとき'
  },
  // パターン6
  {
    aries: 'イライラしそうなとき', taurus: '贅沢したいと思ったとき', gemini: '話が盛り上がったとき',
    cancer: '涙が出そうなとき', leo: '自慢したいことがあるとき', virgo: 'ミスを見つけたとき',
    libra: '争いを避けたいとき', scorpio: '嫉妬心を感じたとき', sagittarius: '自由を感じたいとき',
    capricorn: '責任を感じるとき', aquarius: '人と違うことをしたいとき', pisces: '優しさに触れたとき'
  },
]

// 各星座の今日のキーワード（毎日ローテーション）
const ZODIAC_DAILY_KEYWORDS = [
  { aries: '一歩踏み出す', taurus: 'ゆったり構える', gemini: '好奇心のままに', cancer: '心を開く', leo: '自分を信じる', virgo: '丁寧に向き合う', libra: '調和を大切に', scorpio: '本質を見極める', sagittarius: '視野を広げる', capricorn: '着実に進む', aquarius: '常識を超える', pisces: '直感を信じる' },
  { aries: '即断即決', taurus: '五感を楽しむ', gemini: '会話から学ぶ', cancer: '大切な人を守る', leo: '輝きを放つ', virgo: '分析して理解', libra: 'バランス感覚', scorpio: '深く掘り下げる', sagittarius: '冒険心を持つ', capricorn: '目標に集中', aquarius: '独自の発想', pisces: '共感と癒し' },
  { aries: '情熱を燃やす', taurus: '確実な一歩', gemini: '情報をキャッチ', cancer: '居場所を作る', leo: '注目を集める', virgo: '改善点を見つける', libra: '美意識を高める', scorpio: '変容の力', sagittarius: '楽観的に', capricorn: '実力を発揮', aquarius: '未来を見据える', pisces: '芸術的センス' },
  { aries: 'チャレンジ精神', taurus: '堅実な判断', gemini: '言葉の力', cancer: '思いやりの心', leo: '堂々と振る舞う', virgo: '効率を上げる', libra: '人との縁', scorpio: '集中力を発揮', sagittarius: '知識欲を満たす', capricorn: '忍耐と努力', aquarius: '革新的なアイデア', pisces: 'インスピレーション' },
  { aries: '勝負に出る', taurus: '価値あるものを', gemini: '柔軟な対応', cancer: '家庭運アップ', leo: '表現力を活かす', virgo: '細部にこだわる', libra: '協力して成功', scorpio: '再生と復活', sagittarius: '明るい未来', capricorn: 'キャリアアップ', aquarius: '人脈を広げる', pisces: '神秘的な体験' },
  { aries: 'エネルギー全開', taurus: '安心感を得る', gemini: 'マルチタスク', cancer: '感情を大切に', leo: 'カリスマ性', virgo: '完璧主義を緩める', libra: '平和な時間', scorpio: '真実の追求', sagittarius: '自由な発想', capricorn: '責任感を持つ', aquarius: 'オリジナリティ', pisces: '夢見る力' },
  { aries: '行動あるのみ', taurus: 'マイペースで', gemini: 'コミュニケーション', cancer: '愛情表現', leo: '創造性を発揮', virgo: '健康管理', libra: 'パートナーシップ', scorpio: '洞察力', sagittarius: 'ポジティブ思考', capricorn: '計画通りに', aquarius: '個性を貫く', pisces: '優しさの力' },
]

// 曜日別フォーカス
const DAY_OF_WEEK_FOCUS = [
  { day: '日曜日', energy: '太陽のエネルギー', focus: '自己表現と創造性、家族との時間', advice: '自分らしさを大切に' },
  { day: '月曜日', energy: '月のエネルギー', focus: '感情と直感、新しい週のスタート', advice: '心の声に耳を傾けて' },
  { day: '火曜日', energy: '火星のエネルギー', focus: '行動力と勇気、競争心', advice: '積極的にチャレンジを' },
  { day: '水曜日', energy: '水星のエネルギー', focus: 'コミュニケーションと学び', advice: '情報収集と対話を大切に' },
  { day: '木曜日', energy: '木星のエネルギー', focus: '拡大と発展、幸運', advice: '大きな視野で物事を見て' },
  { day: '金曜日', energy: '金星のエネルギー', focus: '愛と美、人間関係', advice: '美しいものに触れる時間を' },
  { day: '土曜日', energy: '土星のエネルギー', focus: '責任と構築、振り返り', advice: '地に足をつけて着実に' },
]

// 季節イベント・特別な日
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

// 月の満ち欠けを簡易計算
function getMoonPhase(date: Date): { phase: string; influence: string } {
  // 2000年1月6日の新月を基準に計算
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

// 日付からシード値を生成
function getDailySeed(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return (year * 10000 + month * 100 + day) % ZODIAC_DAILY_SCENES.length
}

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

    // 日替わり要素を計算
    const dayOfWeek = jstDate.getDay()
    const dayInfo = DAY_OF_WEEK_FOCUS[dayOfWeek]
    const dailySeed = getDailySeed(jstDate)
    const todayScenes = ZODIAC_DAILY_SCENES[dailySeed]
    const todayKeywords = ZODIAC_DAILY_KEYWORDS[dailySeed]
    const moonPhase = getMoonPhase(jstDate)
    const month = jstDate.getMonth() + 1
    const day = jstDate.getDate()
    const specialEvent = getSpecialEvent(month, day)

    // 季節を判定
    let season = ''
    if (month >= 3 && month <= 5) season = '春'
    else if (month >= 6 && month <= 8) season = '夏'
    else if (month >= 9 && month <= 11) season = '秋'
    else season = '冬'

    // 各星座のヒント（参考程度に）
    const zodiacHints = ZODIAC_SIGNS.map((s) => {
      const scene = todayScenes[s.id as keyof typeof todayScenes]
      const keyword = todayKeywords[s.id as keyof typeof todayKeywords]
      return `${s.name}（${s.id}）: ヒント「${keyword}」`
    }).join('、')

    // Gemini APIで12星座分の運勢を一括生成
    const prompt = `あなたはベテランの占い師です。12星座の今日の運勢を、それぞれ全く違う内容で自由に書いてください。

${month}月${day}日（${dayInfo.day}）、${season}${specialEvent ? `、${specialEvent}` : ''}

【お願い】
・友達に話すような親しみやすい文章で
・12星座それぞれ違うストーリー、違うアドバイスに
・同じ言葉やフレーズを繰り返さない
・具体的で実用的なアドバイスを入れる

【参考ヒント（そのまま使わず、インスピレーションとして）】
${zodiacHints}

【文字数の目安】
総合運:180〜250文字、恋愛運:120〜180文字、仕事運:120〜180文字、金運:100〜150文字

【JSON形式で出力】
[
  {
    "zodiac": "aries",
    "overall_rating": 1〜5,
    "overall_text": "...",
    "love_rating": 1〜5,
    "love_text": "...",
    "work_rating": 1〜5,
    "work_text": "...",
    "money_rating": 1〜5,
    "money_text": "...",
    "lucky_color": "色",
    "lucky_item": "アイテム",
    "lucky_direction": "方角"
  }
]
12星座分のJSON配列のみ出力。`

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
        scenePattern: dailySeed,
        moonPhase: moonPhase.phase,
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
