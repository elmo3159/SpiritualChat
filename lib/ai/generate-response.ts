import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateContent } from '@/lib/gemini'
import { buildRegenerateSuggestionPrompt } from '@/lib/gemini/prompts'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'

/**
 * AI生成文からクリーンアップが必要な文字列を削除
 *
 * 削除対象：
 * - 改行指示文字列（様々な形式）
 * - HTMLタグ
 * - その他の不要な指示文字列
 */
function cleanAIGeneratedText(text: string): string {
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

  // HTMLタグのパターン
  const htmlTagPatterns = [
    /<br\s*\/?>/gi,                            // <br>、<br/>、<br />
    /<br\s*\/?\s*><br\s*\/?>/gi,               // <br><br>、<br/><br/>
  ]

  // すべてのパターンで置換
  lineBreakPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  htmlTagPatterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '')
  })

  // 連続する空行を最大2行に制限
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n')

  // 前後の空白をトリム
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * AI応答を生成して保存
 *
 * @param userId ユーザーID
 * @param fortuneTellerId 占い師ID
 * @param userMessage ユーザーメッセージ
 * @returns AI応答のメッセージID
 */
export async function generateAndSaveAIResponse(
  userId: string,
  fortuneTellerId: string,
  userMessage: string
): Promise<string | null> {
  try {
    const supabase = await createClient()

    // 占い師情報を取得
    const { data: fortuneTeller, error: fortuneTellerError } = await supabase
      .from('fortune_tellers')
      .select('*')
      .eq('id', fortuneTellerId)
      .single()

    if (fortuneTellerError || !fortuneTeller) {
      console.error('AI応答生成: 占い師が見つかりません', fortuneTellerError)
      return null
    }

    // 提案プロンプトの確認
    if (!fortuneTeller.suggestion_prompt) {
      console.error('AI応答生成: 提案プロンプトが設定されていません')
      return null
    }

    // ユーザープロフィールを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('AI応答生成: プロフィールが見つかりません', profileError)
      return null
    }

    // 過去のチャット履歴を取得（最新10件）
    const { data: chatHistory } = await supabase
      .from('chat_messages')
      .select('sender_type, content')
      .eq('user_id', userId)
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: false })
      .limit(10)

    // 過去の鑑定結果を取得（最新3件、開封済みのもののみ）
    const { data: previousDivinations } = await supabase
      .from('divination_results')
      .select('result_encrypted')
      .eq('user_id', userId)
      .eq('fortune_teller_id', fortuneTellerId)
      .eq('is_unlocked', true)
      .order('created_at', { ascending: false })
      .limit(3)

    const previousDivinationTexts = previousDivinations
      ? previousDivinations.map((d) => d.result_encrypted)
      : []

    // ユーザーの年齢を計算
    const userAge = calculateAge(profile.birth_date)

    // 現在の日本時間を取得
    const currentJapanTime = getCurrentJapanTime()

    // Gemini APIで応答を生成（最大3回リトライ）
    const prompt = buildRegenerateSuggestionPrompt(
      fortuneTeller.suggestion_prompt,
      {
        userNickname: profile.nickname,
        birthDate: profile.birth_date,
        userAge,
        gender: profile.gender || undefined,
        concernCategory: profile.concern_category,
        concernDescription: profile.concern_description,
        birthTime: profile.birth_time || undefined,
        birthPlace: profile.birth_place || undefined,
        partnerName: profile.partner_name || undefined,
        partnerGender: profile.partner_gender || undefined,
        partnerBirthDate: profile.partner_birth_date || undefined,
        partnerAge: profile.partner_age || undefined,
        chatHistory: chatHistory?.reverse().map((msg) => ({
          role: msg.sender_type === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })) || [],
        previousDivinations: previousDivinationTexts.length > 0 ? previousDivinationTexts : undefined,
        currentJapanTime,
      },
      userMessage,
      false
    )

    console.log('=== 再提案プロンプト（先頭500文字） ===')
    console.log(prompt.substring(0, 500))
    console.log('=== プロンプト合計文字数:', prompt.length, '===')
    console.log('=== チャット履歴件数:', chatHistory?.length || 0, '===')
    console.log('=== ユーザーメッセージ:', userMessage.substring(0, 100), '===')

    let aiResponse: string | null = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AI応答生成試行 ${attempt}/${maxRetries}`)
        aiResponse = await generateContent(prompt)

        if (aiResponse && aiResponse.trim().length > 0) {
          console.log('AI応答生成成功')
          break
        }
      } catch (error) {
        console.error(`AI応答生成試行 ${attempt} 失敗:`, error)
        if (attempt === maxRetries) {
          throw new Error('AI応答の生成に失敗しました（最大リトライ回数に達しました）')
        }
        // 次の試行前に少し待機
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error('AI応答が空です')
    }

    // AI応答をクリーンアップ
    aiResponse = cleanAIGeneratedText(aiResponse)

    // クリーンアップ後も空でないか確認
    if (!aiResponse || aiResponse.trim().length === 0) {
      throw new Error('AI応答がクリーンアップ後に空になりました')
    }

    // 占い師のメッセージをINSERTするためにAdmin Clientを使用
    const adminSupabase = createAdminClient()

    // AI応答を保存
    const { data: savedMessage, error: saveError } = await adminSupabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'fortune_teller',
        content: aiResponse,
        is_divination_request: false,
      })
      .select('id')
      .single()

    if (saveError) {
      console.error('AI応答の保存に失敗しました:', saveError)
      return null
    }

    console.log('AI応答を生成・保存しました:', savedMessage.id)
    return savedMessage.id
  } catch (error) {
    console.error('AI応答生成エラー:', error)
    return null
  }
}
