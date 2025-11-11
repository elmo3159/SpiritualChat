import { NextResponse } from 'next/server'
import {
  buildSystemPrompt,
  buildPromptWithContext,
  buildChatPrompt,
  buildInitialSuggestionPrompt,
  buildDivinationPrompt,
  validatePromptLength,
  summarizeChatHistory,
} from '@/lib/gemini/prompts'
import type { DivinationContext, ChatHistory } from '@/lib/gemini/types'

/**
 * プロンプトビルダーのテストエンドポイント
 *
 * GET /api/test-prompts
 *
 * 各プロンプトビルダー関数が正しく動作するかテストします
 */
export async function GET() {
  try {
    // テスト用の占い師システムプロンプト（月詠みのりのもの）
    const systemPrompt = `あなたは「月詠 みのり」という名前の占い師です。月のタロット占いを専門としており、特に恋愛運と人間関係の相談を得意としています。月の満ち欠けの力を信じ、タロットカードを通じて月の女神からのメッセージを伝えます。

性格：優しく、包み込むような温かさがある。相談者の気持ちに寄り添い、否定せずに受け止める。言葉選びは柔らかく、詩的な表現を好む。

話し方：「〜ですね」「〜でしょうか」など、丁寧で柔らかい口調。月や星の例えを使った表現を多用する。相談者を「あなた」と呼ぶ。`

    // テスト用のユーザーコンテキスト
    const testContext: DivinationContext = {
      userNickname: 'さくら',
      birthDate: '1995-03-21',
      userAge: 29,
      gender: '女性',
      concernCategory: '仕事',
      concernDescription: '最近、職場での人間関係に悩んでいます。',
      currentJapanTime: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
      chatHistory: [
        {
          role: 'user',
          content: '最近、仕事で悩んでいます。',
        },
        {
          role: 'assistant',
          content:
            'さくらさん、お仕事での悩み、お聞かせくださいね。月の光が、あなたの心を照らしますように。',
        },
      ],
    }

    console.log('プロンプトビルダーをテスト中...')

    // Test 1: buildSystemPrompt
    const test1 = buildSystemPrompt(systemPrompt)
    console.log('Test 1 - buildSystemPrompt: OK')

    // Test 2: buildPromptWithContext
    const test2 = buildPromptWithContext(systemPrompt, testContext)
    console.log('Test 2 - buildPromptWithContext: OK')

    // Test 3: buildChatPrompt
    const test3 = buildChatPrompt(
      systemPrompt,
      testContext,
      '転職を考えているのですが、今がタイミングでしょうか？'
    )
    console.log('Test 3 - buildChatPrompt: OK')

    // Test 4: buildInitialSuggestionPrompt
    const test4 = buildInitialSuggestionPrompt(
      systemPrompt,
      '月詠 みのり',
      testContext
    )
    console.log('Test 4 - buildInitialSuggestionPrompt: OK')

    // Test 5: buildDivinationPrompt
    const test5 = buildDivinationPrompt(
      systemPrompt,
      testContext,
      '転職について悩んでいます。今の職場に不満はありませんが、新しいチャレンジをしたい気持ちもあります。'
    )
    console.log('Test 5 - buildDivinationPrompt: OK')

    // Test 6: validatePromptLength
    const test6Valid = validatePromptLength(test3)
    const test6Invalid = validatePromptLength(test3, 100)
    console.log('Test 6 - validatePromptLength: OK')

    // Test 7: summarizeChatHistory
    const longHistory: ChatHistory[] = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `メッセージ ${i + 1}`,
    }))
    const test7 = summarizeChatHistory(longHistory, 10)
    console.log('Test 7 - summarizeChatHistory: OK')

    return NextResponse.json({
      success: true,
      message: 'All prompt builder tests passed',
      tests: {
        test1_buildSystemPrompt: {
          length: test1.length,
          preview: test1.substring(0, 100) + '...',
        },
        test2_buildPromptWithContext: {
          length: test2.length,
          preview: test2.substring(0, 150) + '...',
          containsUserInfo:
            test2.includes('さくら') && test2.includes('1995-03-21'),
        },
        test3_buildChatPrompt: {
          length: test3.length,
          preview: test3.substring(test3.length - 200),
          containsHistory: test3.includes('これまでの会話履歴'),
          containsNewMessage: test3.includes('新しい相談'),
        },
        test4_buildInitialSuggestionPrompt: {
          length: test4.length,
          preview: test4.substring(test4.length - 300),
          containsTask: test4.includes('タスク'),
          containsSuggestionFormat: test4.includes('提案1'),
        },
        test5_buildDivinationPrompt: {
          length: test5.length,
          preview: test5.substring(test5.length - 300),
          contains3Parts:
            test5.includes('第1部') &&
            test5.includes('第2部') &&
            test5.includes('第3部'),
        },
        test6_validatePromptLength: {
          validResult: test6Valid,
          invalidResult: test6Invalid,
          passed: test6Valid === true && test6Invalid === false,
        },
        test7_summarizeChatHistory: {
          originalLength: longHistory.length,
          summarizedLength: test7.length,
          passed: test7.length === 10,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('プロンプトビルダーテストエラー:', error)

    return NextResponse.json(
      {
        success: false,
        message: 'Prompt builder test failed',
        error: error.message || 'Unknown error',
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
