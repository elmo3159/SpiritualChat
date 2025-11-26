import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { generateFullDivination } from '@/lib/gemini/client'
import { buildFullDivinationPrompt } from '@/lib/gemini/prompts'
import type { DivinationContext, ChatHistory } from '@/lib/gemini/types'
import type { GenerateDivinationResponse } from '@/lib/types/divination'
import { calculateAge, getCurrentJapanTime } from '@/lib/utils/datetime'
import { cleanupDivinationMessages } from '@/lib/utils/text-cleanup'
import { createLogger } from '@/lib/utils/logger'
import { logUserAction } from '@/lib/security/audit-log'
import {
  unauthorizedResponse,
  validationErrorResponse,
  notFoundResponse,
  internalErrorResponse,
} from '@/lib/api/response'

const logger = createLogger('api:divination:generate')

// 重複防止用のロック期間（秒）
const DUPLICATE_PREVENTION_SECONDS = 60

// メッセージ送信間隔（ミリ秒）
// 注意: Vercelの無料プランは10秒タイムアウトのため、合計15秒以内に抑える必要がある
// Proプランでは60秒まで可能
const MESSAGE_DELAY_MS = {
  afterGreeting: 2000,  // 鑑定前メッセージ後の待機時間（2秒）
  afterResult: 1000,    // 鑑定結果後の待機時間（1秒）
}

/**
 * 鑑定生成API
 *
 * POST /api/divination/generate
 *
 * AI占い師による本格的な鑑定を生成し、データベースに保存します
 * 鑑定結果は3つのメッセージ（鑑定前、鑑定結果、鑑定後）で構成されます
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 認証チェック
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return unauthorizedResponse()
    }

    // リクエストボディを取得
    const body = await request.json()
    const { fortuneTellerId, requestId } = body

    if (!fortuneTellerId) {
      return validationErrorResponse('占い師IDが必要です')
    }

    // 重複防止: 直近の鑑定をチェック
    const adminSupabaseForCheck = createAdminClient()
    const cutoffTime = new Date(Date.now() - DUPLICATE_PREVENTION_SECONDS * 1000).toISOString()

    const { data: recentDivination, error: recentError } = await adminSupabaseForCheck
      .from('divination_results')
      .select('id, created_at')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentDivination) {
      logger.info('重複リクエストを検出', {
        userId: user.id,
        fortuneTellerId,
        recentDivinationId: recentDivination.id,
        createdAt: recentDivination.created_at,
      })

      // 既存の鑑定が見つかった場合は、その情報を返す（重複処理を防止）
      return NextResponse.json({
        success: true,
        message: '既に鑑定が進行中または完了しています',
        data: {
          divination: {
            id: recentDivination.id,
            isDuplicate: true,
          },
        },
      })
    }

    // 占い師情報を取得
    const { data: fortuneTeller, error: fortuneTellerError } = await supabase
      .from('fortune_tellers')
      .select('*')
      .eq('id', fortuneTellerId)
      .eq('is_active', true)
      .single()

    if (fortuneTellerError || !fortuneTeller) {
      return notFoundResponse('占い師が見つかりません')
    }

    // ユーザープロフィールを取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return notFoundResponse('プロフィール情報が見つかりません')
    }

    // チャット履歴を取得（最新10件）
    const { data: chatMessages, error: chatError } = await supabase
      .from('chat_messages')
      .select('sender_type, content, created_at')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (chatError) {
      logger.error('チャット履歴取得エラー', chatError, {
        userId: user.id,
        fortuneTellerId,
      })
      return internalErrorResponse('チャット履歴の取得に失敗しました')
    }

    // チャット履歴を古い順に並び替え（時系列順）
    const chatHistory: ChatHistory[] = (chatMessages || [])
      .reverse()
      .map((msg) => ({
        role: msg.sender_type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))

    // 過去の鑑定結果を取得（最新3件、開封済みのもののみ）
    const { data: previousDivinations, error: divinationError } = await supabase
      .from('divination_results')
      .select('result_encrypted')
      .eq('user_id', user.id)
      .eq('fortune_teller_id', fortuneTellerId)
      .eq('is_unlocked', true)
      .order('created_at', { ascending: false })
      .limit(3)

    if (divinationError) {
      logger.warn('過去の鑑定結果取得エラー', {
        userId: user.id,
        fortuneTellerId,
        error: divinationError,
      })
      // 過去の鑑定が取得できなくてもエラーにしない
    }

    const previousDivinationTexts = previousDivinations
      ? previousDivinations.map((d) => d.result_encrypted)
      : []

    // ユーザーの年齢を計算
    const userAge = calculateAge(profile.birth_date)

    // 現在の日本時間を取得
    const currentJapanTime = getCurrentJapanTime()

    // DivinationContextを構築
    const context: DivinationContext = {
      userNickname: profile.nickname,
      birthDate: profile.birth_date,
      userAge,
      gender: profile.gender,
      concernCategory: profile.concern_category,
      concernDescription: profile.concern_description,
      birthTime: profile.birth_time || undefined,
      birthPlace: profile.birth_place || undefined,
      partnerName: profile.partner_name || undefined,
      partnerGender: profile.partner_gender || undefined,
      partnerBirthDate: profile.partner_birth_date || undefined,
      partnerAge: profile.partner_age || undefined,
      chatHistory,
      previousDivinations: previousDivinationTexts.length > 0 ? previousDivinationTexts : undefined,
      currentJapanTime,
    }

    // 鑑定プロンプトを構築
    const prompt = buildFullDivinationPrompt(
      fortuneTeller.divination_prompt,
      fortuneTeller.name,
      context
    )

    logger.debug('鑑定プロンプトを構築', {
      userId: user.id,
      fortuneTellerId,
      promptLength: prompt.length,
    })

    // Gemini APIで鑑定を生成
    const rawDivination = await generateFullDivination(prompt)

    // 生成された鑑定結果から不要な文字列を削除
    const divination = cleanupDivinationMessages(rawDivination)

    logger.debug('鑑定を生成', {
      userId: user.id,
      fortuneTellerId,
      resultLength: divination.resultMessage.length,
    })

    // 鑑定結果の最初の20文字をプレビューとして取得
    const resultPreview = divination.resultMessage.substring(0, 20)

    // 占い師のメッセージをINSERTするためにAdmin Clientを使用
    const adminSupabase = createAdminClient()

    // 1. 鑑定前メッセージを保存
    const { error: greetingError } = await adminSupabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'fortune_teller',
        content: divination.greetingMessage,
        is_divination_request: false,
      })

    if (greetingError) {
      logger.error('鑑定前メッセージ保存エラー', greetingError, {
        userId: user.id,
        fortuneTellerId,
      })
      return internalErrorResponse('鑑定前メッセージの保存に失敗しました')
    }

    logger.debug('鑑定前メッセージを送信', { userId: user.id, fortuneTellerId })

    // メッセージ間の待機（Realtimeでのリアルタイム表示用）
    await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_MS.afterGreeting))

    // 2. 鑑定結果を保存
    const { data: savedDivination, error: insertError } = await adminSupabase
      .from('divination_results')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        greeting_message: divination.greetingMessage,
        result_encrypted: divination.resultMessage,
        result_preview: resultPreview,
        after_message: divination.afterMessage,
        is_unlocked: false,
      })
      .select()
      .single()

    if (insertError || !savedDivination) {
      logger.error('鑑定結果保存エラー', insertError, {
        userId: user.id,
        fortuneTellerId,
      })
      return internalErrorResponse('鑑定結果の保存に失敗しました')
    }

    const savedDivinationId = savedDivination.id

    logger.debug('鑑定結果を保存', {
      userId: user.id,
      fortuneTellerId,
      divinationId: savedDivinationId,
    })

    // メッセージ間の待機（Realtimeでのリアルタイム表示用）
    await new Promise(resolve => setTimeout(resolve, MESSAGE_DELAY_MS.afterResult))

    // 3. 鑑定後メッセージを保存
    const { error: afterError } = await adminSupabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        fortune_teller_id: fortuneTellerId,
        sender_type: 'fortune_teller',
        content: divination.afterMessage,
        is_divination_request: false,
      })

    if (afterError) {
      logger.warn('鑑定後メッセージ保存エラー', {
        userId: user.id,
        fortuneTellerId,
        error: afterError,
      })
      // 鑑定後メッセージの保存に失敗してもエラーにはしない
    }

    logger.info('鑑定生成完了', {
      userId: user.id,
      fortuneTellerId,
      divinationId: savedDivinationId,
      resultLength: divination.resultMessage.length,
    })

    // 監査ログ：鑑定生成成功
    await logUserAction(user.id, user.email, 'divination_generate', {
      resourceType: 'divination_result',
      resourceId: savedDivinationId,
      details: {
        fortuneTellerId,
        fortuneTellerName: fortuneTeller.name,
        resultLength: divination.resultMessage.length,
      },
    })

    // レスポンスを返却（全メッセージ送信済み）
    // クライアント側のRealtimeサブスクリプションでリアルタイムに表示される
    const response: GenerateDivinationResponse = {
      success: true,
      message: '鑑定を開始しました',
      data: {
        divination: {
          id: savedDivinationId,
          greetingMessage: divination.greetingMessage,
          resultPreview: resultPreview,
          afterMessage: divination.afterMessage,
          isUnlocked: false,
          pointsConsumed: null,
          unlockedAt: null,
          createdAt: savedDivination.created_at,
        },
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    logger.error('鑑定生成エラー', error instanceof Error ? error : undefined)
    return internalErrorResponse('鑑定の生成に失敗しました')
  }
}
