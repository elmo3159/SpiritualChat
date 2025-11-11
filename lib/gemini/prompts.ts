import type {
  FortuneTellerPersonality,
  ChatHistory,
  DivinationContext,
} from './types'

/**
 * システムプロンプトビルダー
 *
 * 占い師の性格設定とユーザーコンテキストを組み合わせて、
 * Gemini APIに渡す完全なプロンプトを構築します
 */

/**
 * 基本的なシステムプロンプトを構築
 *
 * データベースから取得した占い師のsystem_promptをそのまま使用
 */
export function buildSystemPrompt(systemPrompt: string): string {
  return systemPrompt
}

/**
 * ユーザーコンテキストを含むプロンプトを構築
 *
 * @param systemPrompt - 占い師のシステムプロンプト（データベースから取得）
 * @param context - ユーザーのプロフィール情報
 * @returns 完全なシステムプロンプト
 */
export function buildPromptWithContext(
  systemPrompt: string,
  context: DivinationContext
): string {
  const {
    userNickname,
    birthDate,
    userAge,
    gender,
    concernCategory,
    concernDescription,
    birthTime,
    birthPlace,
    partnerName,
    partnerGender,
    partnerBirthDate,
    partnerAge,
    currentJapanTime,
  } = context

  let contextPrompt = `\n\n【現在時刻】\n`
  contextPrompt += `${currentJapanTime}\n`

  contextPrompt += `\n【相談者情報】\n`
  contextPrompt += `- ニックネーム: ${userNickname || '未設定'}\n`
  contextPrompt += `- 生年月日: ${birthDate}\n`
  if (userAge !== undefined && userAge !== null) {
    contextPrompt += `- 年齢: ${userAge}歳\n`
  }
  if (birthTime) {
    contextPrompt += `- 出生時刻: ${birthTime}\n`
  }
  if (birthPlace) {
    contextPrompt += `- 現在住んでいる都道府県: ${birthPlace}\n`
  }
  if (gender) {
    contextPrompt += `- 性別: ${gender}\n`
  }
  contextPrompt += `- お悩みのカテゴリ: ${concernCategory}\n`

  // お相手の情報（ある場合）
  if (partnerName || partnerGender || partnerBirthDate || partnerAge) {
    contextPrompt += `\n【お相手の情報】\n`
    if (partnerName) {
      contextPrompt += `- お名前: ${partnerName}\n`
    }
    if (partnerGender) {
      contextPrompt += `- 性別: ${partnerGender}\n`
    }
    if (partnerBirthDate) {
      contextPrompt += `- 生年月日: ${partnerBirthDate}\n`
    }
    if (partnerAge !== undefined && partnerAge !== null) {
      contextPrompt += `- 年齢: ${partnerAge}歳\n`
    }
  }

  // お悩みの内容
  contextPrompt += `\n【お悩みの内容】\n`
  contextPrompt += `${concernDescription}\n`

  return systemPrompt + contextPrompt
}

/**
 * チャット履歴を含む会話プロンプトを構築
 *
 * @param systemPrompt - 占い師のシステムプロンプト
 * @param context - ユーザーコンテキスト
 * @param userMessage - 現在のユーザーメッセージ
 * @returns Gemini APIに渡す完全なプロンプト
 */
export function buildChatPrompt(
  systemPrompt: string,
  context: DivinationContext,
  userMessage: string
): string {
  const basePrompt = buildPromptWithContext(systemPrompt, context)

  let chatPrompt = basePrompt

  // チャット履歴がある場合は含める
  if (context.chatHistory && context.chatHistory.length > 0) {
    chatPrompt += `\n\n【これまでの会話履歴】\n`
    context.chatHistory.forEach((message, index) => {
      if (message.role === 'user') {
        chatPrompt += `\n${context.userNickname}さん: ${message.content}\n`
      } else {
        chatPrompt += `\nあなた: ${message.content}\n`
      }
    })
  }

  // 現在のメッセージ
  chatPrompt += `\n\n【新しい相談】\n`
  chatPrompt += `${context.userNickname}さん: ${userMessage}\n\n`
  chatPrompt += `上記の相談に対して、あなたの性格と鑑定スタイルに沿って回答してください。`

  return chatPrompt
}

/**
 * 初回提案文生成用のプロンプトを構築
 *
 * ユーザーが最初にチャットを開いたときの挨拶と提案を生成します
 *
 * @param suggestionPrompt - 占い師の初回提案プロンプト
 * @param context - ユーザーコンテキスト
 * @returns 初回提案文生成用プロンプト
 */
export function buildInitialSuggestionPrompt(
  suggestionPrompt: string,
  context: DivinationContext
): string {
  const basePrompt = buildPromptWithContext(suggestionPrompt, context)

  return basePrompt
}

/**
 * 鑑定結果生成用のプロンプトを構築（3部構成）
 *
 * @param systemPrompt - 占い師のシステムプロンプト
 * @param context - ユーザーコンテキスト
 * @param consultationSummary - 相談内容のまとめ
 * @returns 鑑定結果生成用プロンプト
 */
export function buildDivinationPrompt(
  systemPrompt: string,
  context: DivinationContext,
  consultationSummary: string
): string {
  const basePrompt = buildPromptWithContext(systemPrompt, context)

  let divinationPrompt = basePrompt
  divinationPrompt += `\n\n【鑑定依頼】\n`
  divinationPrompt += `${context.userNickname}さんから以下の相談を受けました：\n\n`
  divinationPrompt += `${consultationSummary}\n\n`
  divinationPrompt += `これまでの会話履歴：\n`

  if (context.chatHistory && context.chatHistory.length > 0) {
    context.chatHistory.forEach((message) => {
      if (message.role === 'user') {
        divinationPrompt += `${context.userNickname}さん: ${message.content}\n`
      } else {
        divinationPrompt += `あなた: ${message.content}\n`
      }
    })
  }

  divinationPrompt += `\n\n【タスク】\n`
  divinationPrompt += `上記の相談内容について、あなたの占術と鑑定スタイルに基づいて、\n`
  divinationPrompt += `以下の3部構成で詳しい鑑定結果を書いてください：\n\n`

  divinationPrompt += `## 第1部：現状分析（300-400文字）\n`
  divinationPrompt += `相談者の現在の状況を、あなたの占術を使って分析してください。\n`
  divinationPrompt += `具体的な占いの結果（カードの意味、星の配置など）を含めてください。\n\n`

  divinationPrompt += `## 第2部：未来予測（300-400文字）\n`
  divinationPrompt += `今後の展開や可能性について予測してください。\n`
  divinationPrompt += `良い面と注意すべき点の両方を伝えてください。\n\n`

  divinationPrompt += `## 第3部：アドバイス（300-400文字）\n`
  divinationPrompt += `具体的で実践的なアドバイスを提供してください。\n`
  divinationPrompt += `相談者が今すぐ行動できることを含めてください。\n\n`

  divinationPrompt += `【注意事項】\n`
  divinationPrompt += `- 各部は「## 第○部：タイトル」で始めてください\n`
  divinationPrompt += `- あなたの性格と話し方を一貫して保ってください\n`
  divinationPrompt += `- 前向きで希望が持てる内容にしてください\n`
  divinationPrompt += `- 合計で900-1200文字程度の長さにしてください`

  return divinationPrompt
}

/**
 * プロンプトの長さを検証
 *
 * @param prompt - 検証するプロンプト
 * @param maxLength - 最大文字数（デフォルト: 30000）
 * @returns プロンプトが長すぎる場合はfalse
 */
export function validatePromptLength(
  prompt: string,
  maxLength: number = 30000
): boolean {
  return prompt.length <= maxLength
}

/**
 * 追加メッセージによる提案再生成用のプロンプトを構築
 *
 * ユーザーが追加情報を送信した後、または鑑定結果を開封した後に新しい提案を生成します
 *
 * @param suggestionPrompt - 占い師の提案プロンプト
 * @param context - ユーザーコンテキスト（チャット履歴を含む）
 * @param latestContent - 最新のコンテンツ（ユーザーメッセージまたは開封された鑑定結果）
 * @param isFromDivination - 鑑定結果開封後の場合はtrue、メッセージ送信後の場合はfalse
 * @returns 提案再生成用プロンプト
 */
export function buildRegenerateSuggestionPrompt(
  suggestionPrompt: string,
  context: DivinationContext,
  latestContent: string,
  isFromDivination: boolean = false
): string {
  // 状況に応じて異なる指示を追加
  let regeneratePrompt = ''

  if (isFromDivination) {
    // 鑑定結果開封後の提案
    regeneratePrompt = `【重要な指示】
これは鑑定結果を開封した後の、次の提案文の生成です。
鑑定結果を読んでくれたことへの感謝を含めてください。
ただし、「チャットルームに来てくださってありがとうございます」などの初回チャット開始時の挨拶は不要です。
鑑定結果を踏まえた、次の鑑定の提案をしてください。

`
  } else {
    // ユーザーメッセージ送信後の提案
    regeneratePrompt = `【重要な指示】
これはお客様からチャットメッセージが送られた後の、再提案文の生成です。

【絶対に禁止する内容】
- 「〇〇です」「ゆらです」などの名乗りや自己紹介（既に会話が始まっているため）
- 「鑑定結果を読んでくださって、ありがとうございます」（これは鑑定結果開封後にのみ使用）
- 「チャットルームに来てくださってありがとうございます」などの初回挨拶
- 「はじめまして」などの初対面の挨拶

【必ず守る流れ】
1. まず「メッセージありがとうございます☺️」などの、メッセージを送ってくれたことへの感謝から始める
2. お客様が送ってくださった最新メッセージの内容に触れる
3. その内容を踏まえた次の鑑定の提案をする

会話の途中であることを意識し、自然な流れで次の鑑定を提案してください。

`
  }

  const basePrompt = buildPromptWithContext(suggestionPrompt, context)
  regeneratePrompt += basePrompt

  // 過去の鑑定結果をすべて含める
  if (context.previousDivinations && context.previousDivinations.length > 0) {
    regeneratePrompt += `\n\n【これまでの鑑定結果】\n`
    context.previousDivinations.forEach((divination, index) => {
      regeneratePrompt += `\n--- 鑑定 ${index + 1} ---\n`
      regeneratePrompt += `${divination}\n`
    })
  }

  // 会話履歴全体を含める（ユーザーと占い師の両方）
  if (context.chatHistory && context.chatHistory.length > 0) {
    regeneratePrompt += `\n\n【これまでの会話履歴（時系列順）】\n`
    context.chatHistory.forEach((message) => {
      if (message.role === 'user') {
        regeneratePrompt += `${context.userNickname}さん: ${message.content}\n\n`
      } else {
        regeneratePrompt += `あなた: ${message.content}\n\n`
      }
    })
  }

  // 最新のコンテンツを明確に識別
  if (isFromDivination) {
    regeneratePrompt += `\n\n【最新の情報：開封された鑑定結果】\n`
    regeneratePrompt += `${latestContent}\n`
    regeneratePrompt += `\n鑑定結果を読んでくれたので、次の鑑定提案をしてください。\n`

    regeneratePrompt += `\n【再確認】
これは鑑定結果開封後の提案文生成です。
鑑定結果を読んでくれたことへの感謝を含め、次の鑑定を提案してください。`
  } else {
    regeneratePrompt += `\n\n【最新の情報：お客様からの新しいメッセージ】\n`
    regeneratePrompt += `${context.userNickname}さん: ${latestContent}\n`
    regeneratePrompt += `\nこの最新メッセージに対応した、次の鑑定提案をしてください。\n`

    regeneratePrompt += `\n【再確認】
これはお客様からメッセージを受け取った後の提案文生成です。
名乗り・自己紹介・鑑定結果への感謝は絶対に不要です。
「メッセージありがとうございます」から始め、メッセージ内容に触れてから鑑定を提案してください。`
  }

  return regeneratePrompt
}

/**
 * 完全な鑑定結果生成用のプロンプトを構築（3通のメッセージ形式）
 *
 * 鑑定前メッセージ、鑑定結果（400文字程度）、鑑定後メッセージの3つを生成します
 *
 * @param systemPrompt - 占い師のシステムプロンプト
 * @param fortuneTellerName - 占い師の名前
 * @param context - ユーザーコンテキスト（プロフィール、チャット履歴を含む）
 * @returns 完全な鑑定結果生成用プロンプト
 */
export function buildFullDivinationPrompt(
  systemPrompt: string,
  fortuneTellerName: string,
  context: DivinationContext
): string {
  const basePrompt = buildPromptWithContext(systemPrompt, context)

  let divinationPrompt = basePrompt

  // これまでの会話履歴を含める
  if (context.chatHistory && context.chatHistory.length > 0) {
    divinationPrompt += `\n\n【これまでの会話履歴】\n`
    context.chatHistory.forEach((message) => {
      if (message.role === 'user') {
        divinationPrompt += `${context.userNickname}さん: ${message.content}\n`
      } else {
        divinationPrompt += `あなた: ${message.content}\n`
      }
    })
  }

  // 過去の鑑定結果がある場合は含める
  if (context.previousDivinations && context.previousDivinations.length > 0) {
    divinationPrompt += `\n\n【過去の鑑定結果】\n`
    context.previousDivinations.forEach((divination, index) => {
      divinationPrompt += `\n--- 鑑定 ${index + 1} ---\n`
      divinationPrompt += `${divination}\n`
    })
  }

  // 状況のみ伝える（すべての指示は管理画面で設定したプロンプトに含まれる）
  divinationPrompt += `\n\n【状況】\n`
  divinationPrompt += `${context.userNickname}さんがあなたに「占ってもらう」ボタンを押しました。\n`
  divinationPrompt += `これまでの会話内容と相談者の情報を踏まえて、本格的な鑑定を行ってください。`

  return divinationPrompt
}

/**
 * チャット履歴を要約して短縮
 *
 * プロンプトが長くなりすぎる場合、古いメッセージを要約します
 *
 * @param chatHistory - チャット履歴
 * @param maxMessages - 保持する最大メッセージ数
 * @returns 短縮されたチャット履歴
 */
export function summarizeChatHistory(
  chatHistory: ChatHistory[],
  maxMessages: number = 10
): ChatHistory[] {
  if (chatHistory.length <= maxMessages) {
    return chatHistory
  }

  // 最新のメッセージを保持
  return chatHistory.slice(-maxMessages)
}
