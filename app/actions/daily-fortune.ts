'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { updateLevelOnPointsUsed } from '@/lib/services/level-service'
import { checkAndAwardBadges } from '@/lib/services/badge-service'

const DAILY_FORTUNE_COST = 1000 // ポイント

const SYSTEM_PROMPT = `
あなたは「今日の運勢」を専門とする、経験豊かなスピリチュアルカウンセラーです。

【あなたの役割】
- ユーザーの生年月日、悩み、過去の相談内容を踏まえた、今日一日の運勢とエネルギーの流れを読み取る
- その日の全体的な傾向、心構え、注意点を伝える
- ユーザーが前向きに一日を過ごせるようサポートする

【言葉遣いについて】
- 難しい言葉や専門用語は使わず、誰にでもわかりやすい日常的な言葉で話してください
- 小学生でも理解できるような、やさしくシンプルな表現を心がけてください
- 漢字が多くならないよう、ひらがなも適度に使ってください

【重要な制約】
1. 確証のない具体的行動指示は絶対に避けてください
   ❌ NG例: "今日彼に連絡してみるといいでしょう"
   ❌ NG例: "午後3時に告白すると成功します"
   ❌ NG例: "今日は転職活動を始めましょう"

   ✅ OK例: "コミュニケーションに良いエネルギーが流れています"
   ✅ OK例: "大切な人との対話を意識する日"
   ✅ OK例: "新しいことを始めるのに適した時期が近づいています"

2. 「傾向」「エネルギー」「流れ」「適している/適していない」という表現を使う
3. 「〜してください」ではなく「〜を意識すると良い」「〜に適した日」と伝える
4. ポジティブだが現実的に。過度な期待を持たせない

【改行ルール】
・改行は Shift+Enter の改行のみを使うこと
・HTMLタグ（<br> や <br><br>）は一切使わないこと
・「です。」「ます。」「ですね。」「ですよ。」などの文末のあとには、必ず改行を２回入れてください

💡 改行ルールの指定
・文章を読みやすくするため、文末には必ず改行を入れて視覚的なボリューム感を出してください

【ラッキーアイテムとラッキー行動について】
- ラッキーアイテムは、日常的に身近にあるもの、すぐに手に入るものを選んでください
  ✅ 良い例: ハンカチ、ボールペン、お茶、チョコレート、スマホケース、靴下、マグカップなど
  ❌ 悪い例: パワーストーン、高級な物、入手困難なもの

- ラッキー行動は、普通の人が簡単にできる、日常的な行動を選んでください
  ✅ 良い例: 朝のストレッチ、好きな音楽を聴く、温かい飲み物を飲む、笑顔で挨拶する、窓を開けて深呼吸など
  ❌ 悪い例: 瞑想、ヨガ、特別な修行、珍しい場所に行くこと

【出力形式】
以下の形式で、合計400文字程度で出力してください。

[OVERALL]
(総合運: 今日一日の全体的なエネルギーの流れ。100文字程度)

[FOCUS_AREA]
(重点運勢: ユーザーの悩みカテゴリに特化した運勢。恋愛/仕事/人間関係など。150文字程度)

[ADVICE]
(今日の心構え: 今日意識すると良いこと、注意点。100文字程度)

[LUCKY]
ラッキーカラー: (色の名前)
ラッキーアイテム: (アイテム名)
ラッキー行動: (簡潔な行動)
`

interface DailyFortuneResult {
  overall: string
  focus_area: string
  advice: string
  lucky_color: string
  lucky_item: string
  lucky_action: string
}

/**
 * 今日の運勢を取得（既存の場合はキャッシュから）
 */
export async function getDailyFortune(date?: string) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: '認証が必要です' }
  }

  const today = date || new Date().toISOString().split('T')[0]

  // 既に今日の運勢を見ているかチェック
  const { data: existingFortune, error: fetchError } = await supabase
    .from('daily_fortunes')
    .select('*')
    .eq('user_id', user.id)
    .eq('fortune_date', today)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    return { error: '運勢の取得に失敗しました' }
  }

  return { fortune: existingFortune || null }
}

/**
 * 今日の運勢を生成して購入
 */
export async function purchaseDailyFortune() {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: '認証が必要です' }
  }

  const today = new Date().toISOString().split('T')[0]

  // 既に購入済みかチェック
  const { data: existingFortune } = await supabase
    .from('daily_fortunes')
    .select('*')
    .eq('user_id', user.id)
    .eq('fortune_date', today)
    .single()

  if (existingFortune) {
    return { error: '今日の運勢は既にご覧になっています' }
  }

  // ポイント残高チェック
  const { data: userPoints } = await supabaseAdmin
    .from('user_points')
    .select('points_balance')
    .eq('user_id', user.id)
    .single()

  if (!userPoints || userPoints.points_balance < DAILY_FORTUNE_COST) {
    return { error: 'ポイントが不足しています' }
  }

  try {
    // ユーザー情報と過去のメッセージを取得
    const userContext = await buildUserContext(user.id, today)

    // Gemini APIで運勢を生成
    const fortune = await generateFortuneWithGemini(userContext)

    // トランザクション開始
    // 1. ポイント消費
    const { error: pointError } = await supabaseAdmin
      .from('user_points')
      .update({
        points_balance: userPoints.points_balance - DAILY_FORTUNE_COST,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (pointError) {
      throw new Error('ポイントの消費に失敗しました')
    }

    // 2. ポイント履歴記録
    await supabaseAdmin.from('point_transactions').insert({
      user_id: user.id,
      amount: -DAILY_FORTUNE_COST,
      type: 'daily_fortune',
      description: '今日の運勢',
    })

    // 2.5. レベル更新（ポイント使用による経験値獲得）
    await updateLevelOnPointsUsed(user.id, DAILY_FORTUNE_COST)

    // 2.6. バッジチェック（新しいバッジを獲得できるか確認）
    await checkAndAwardBadges(user.id)

    // 3. 運勢を保存
    const { data: savedFortune, error: saveError } = await supabaseAdmin
      .from('daily_fortunes')
      .insert({
        user_id: user.id,
        fortune_date: today,
        overall: fortune.overall,
        focus_area: fortune.focus_area,
        advice: fortune.advice,
        lucky_color: fortune.lucky_color,
        lucky_item: fortune.lucky_item,
        lucky_action: fortune.lucky_action,
        points_spent: DAILY_FORTUNE_COST,
      })
      .select()
      .single()

    if (saveError) {
      throw new Error('運勢の保存に失敗しました')
    }

    return { fortune: savedFortune }
  } catch (error) {
    console.error('今日の運勢生成エラー:', error)
    return { error: error instanceof Error ? error.message : '運勢の生成に失敗しました' }
  }
}

/**
 * ユーザーコンテキストを構築
 */
async function buildUserContext(userId: string, date: string): Promise<string> {
  const supabaseAdmin = createAdminClient()

  // プロフィール取得
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (!profile) {
    throw new Error('プロフィールが見つかりません')
  }

  // 過去のメッセージ取得（全件）
  const { data: messages } = await supabaseAdmin
    .from('messages')
    .select('content, created_at')
    .eq('user_id', userId)
    .eq('sender_type', 'user')
    .order('created_at', { ascending: false })

  // 過去の運勢データから、過去30日分のラッキーアイテムとラッキー行動を取得
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { data: pastFortunes } = await supabaseAdmin
    .from('daily_fortunes')
    .select('lucky_item, lucky_action, fortune_date')
    .eq('user_id', userId)
    .gte('fortune_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('fortune_date', { ascending: false })
    .limit(30)

  const concernCategoryMap: Record<string, string> = {
    'love': '恋愛',
    'crush': '片思い',
    'reunion': '復縁',
    'affair': '不倫/浮気',
    'marriage': '結婚',
    'work': '仕事',
    'family': '家庭問題',
    'money': '金運'
  }

  const genderMap: Record<string, string> = {
    'male': '男性',
    'female': '女性',
    'other': 'その他'
  }

  // プロンプト構築
  let userPrompt = `
【ユーザー情報】
名前: ${profile.name || 'お客様'}
生年月日: ${profile.birth_date || '未設定'}
性別: ${profile.gender ? genderMap[profile.gender] || profile.gender : '未設定'}
主な悩みカテゴリ: ${profile.concern_category ? concernCategoryMap[profile.concern_category] || profile.concern_category : '未設定'}
`

  if (profile.partner_name) {
    userPrompt += `
【お相手の情報】
お名前: ${profile.partner_name}
性別: ${profile.partner_gender ? genderMap[profile.partner_gender] || profile.partner_gender : '未設定'}
`
    if (profile.partner_birth_date) {
      userPrompt += `生年月日: ${profile.partner_birth_date}\n`
    } else if (profile.partner_age) {
      userPrompt += `年齢: ${profile.partner_age}代\n`
    }
  }

  if (messages && messages.length > 0) {
    userPrompt += `
【過去の相談内容】
これまでユーザーが占い師に相談した内容です。現在の状況や悩みを理解するための参考にしてください。

${messages.map(m => `- ${m.content}`).join('\n')}

※ これらの過去の相談内容を踏まえて、今日（${date}）の運勢を占ってください。
※ ただし、過去の相談内容に直接言及する必要はありません。文脈として理解し、今日の運勢に反映させてください。
`
  }

  const weekday = new Date(date).toLocaleDateString('ja-JP', { weekday: 'long' })
  userPrompt += `
【占う日付】
${date}（${weekday}）
`

  // 過去のラッキーアイテムとラッキー行動がある場合、重複回避の指示を追加
  if (pastFortunes && pastFortunes.length > 0) {
    const pastItems = pastFortunes
      .map(f => f.lucky_item)
      .filter(item => item)
      .join('、')

    const pastActions = pastFortunes
      .map(f => f.lucky_action)
      .filter(action => action)
      .join('、')

    if (pastItems || pastActions) {
      userPrompt += `
【重要: 過去に提案したラッキーアイテム・ラッキー行動】
以下は過去30日間にこのユーザーに提案したラッキーアイテムとラッキー行動です。
今回は、これらと重複しないものを選んでください。

`
      if (pastItems) {
        userPrompt += `過去のラッキーアイテム: ${pastItems}\n`
      }
      if (pastActions) {
        userPrompt += `過去のラッキー行動: ${pastActions}\n`
      }
      userPrompt += '\n'
    }
  }

  userPrompt += `上記の情報を踏まえ、この方の今日一日の運勢を占ってください。
制約を守り、指定された出力形式で回答してください。
`

  return userPrompt
}

/**
 * Gemini APIで運勢を生成
 */
async function generateFortuneWithGemini(userContext: string): Promise<DailyFortuneResult> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY が設定されていません')
  }

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

  const prompt = SYSTEM_PROMPT + '\n\n' + userContext

  const result = await model.generateContent(prompt)
  const response = result.response.text()

  // レスポンスをパース
  return parseFortuneResponse(response)
}

/**
 * テキストをクリーンアップ（HTMLタグや不要な文字列を削除）
 */
function cleanText(text: string): string {
  let cleaned = text

  // 改行指示文字列のパターン（様々な形式に対応）
  const lineBreakPatterns = [
    /\*\*[（(]改行[2２二]?回?[）)]\*\*/g,      // **（改行2回）**、**(改行2回)**
    /\*\*[（(]改行[）)]\*\*/g,                 // **（改行）**、**(改行)**
    /[（(]改行[2２二]?回?[）)]/g,              // （改行2回）、(改行2回)
    /[（(]改行[）)]/g,                         // （改行）、(改行)
    /\*\*改行[2２二]?回?\*\*/g,                // **改行2回**
    /\*\*改行\*\*/g,                           // **改行**
    /改行[2２二]?回?指示/g,                    // 改行2回指示
    /改行を[2２二]?回?入れ/g,                  // 改行を2回入れ
  ]

  // すべての改行指示パターンで置換
  lineBreakPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  return cleaned
    .replace(/<br\s*\/?>/gi, '') // <br>タグを削除
    .replace(/<br\s*\/?\s*><br\s*\/?>/gi, '') // <br><br>を削除
    .replace(/&nbsp;/g, ' ') // &nbsp;をスペースに変換
    .replace(/&lt;/g, '<') // &lt;を<に変換
    .replace(/&gt;/g, '>') // &gt;を>に変換
    .replace(/&amp;/g, '&') // &amp;を&に変換
    .trim() // 前後の空白を削除
}

/**
 * Geminiのレスポンスをパース
 */
function parseFortuneResponse(response: string): DailyFortuneResult {
  const overallMatch = response.match(/\[OVERALL\]\s*([\s\S]*?)(?=\[FOCUS_AREA\]|$)/)
  const focusMatch = response.match(/\[FOCUS_AREA\]\s*([\s\S]*?)(?=\[ADVICE\]|$)/)
  const adviceMatch = response.match(/\[ADVICE\]\s*([\s\S]*?)(?=\[LUCKY\]|$)/)
  const luckyMatch = response.match(/\[LUCKY\]\s*([\s\S]*?)$/)

  let luckyColor = ''
  let luckyItem = ''
  let luckyAction = ''

  if (luckyMatch) {
    const luckyText = luckyMatch[1]
    const colorMatch = luckyText.match(/ラッキーカラー[:：]\s*(.+)/m)
    const itemMatch = luckyText.match(/ラッキーアイテム[:：]\s*(.+)/m)
    const actionMatch = luckyText.match(/ラッキー行動[:：]\s*(.+)/m)

    luckyColor = colorMatch ? cleanText(colorMatch[1]) : ''
    luckyItem = itemMatch ? cleanText(itemMatch[1]) : ''
    luckyAction = actionMatch ? cleanText(actionMatch[1]) : ''
  }

  return {
    overall: overallMatch ? cleanText(overallMatch[1]) : '',
    focus_area: focusMatch ? cleanText(focusMatch[1]) : '',
    advice: adviceMatch ? cleanText(adviceMatch[1]) : '',
    lucky_color: luckyColor,
    lucky_item: luckyItem,
    lucky_action: luckyAction,
  }
}
