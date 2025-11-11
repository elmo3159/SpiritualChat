import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { ArrowLeft, User, CreditCard } from 'lucide-react'
import Link from 'next/link'
import PointManagement from '@/app/components/admin/PointManagement'
import MessageLimitResetWrapper from './MessageLimitResetWrapper'
import UserDetailTabs from './UserDetailTabs'
import { MAX_MESSAGES_PER_DAY } from '@/lib/supabase/message-limits'

/**
 * ユーザー詳細ページ
 *
 * 個別ユーザーの詳細情報とポイント管理機能を提供
 */

interface UserDetail {
  id: string
  email: string
  created_at: string
  nickname: string | null
  birth_date: string | null
  gender: string | null
  concern_category: string | null
  concern_description: string | null
  partner_name: string | null
  partner_gender: string | null
  partner_birth_date: string | null
  points_balance: number
}

interface DivinationHistory {
  id: string
  created_at: string
  result_encrypted: string
  points_consumed: number | null
  fortune_teller: {
    name: string
  } | null
}

interface ChatMessage {
  id: string
  created_at: string
  sender_type: 'user' | 'fortune_teller'
  content: string
  is_divination_request: boolean
  is_unlocked?: boolean | null
  type: 'message' | 'divination'
  fortune_teller: {
    id: string
    name: string
  }
}

interface ChatHistoryByFortuneTeller {
  fortuneTellerId: string
  fortuneTellerName: string
  messages: ChatMessage[]
}

interface MessageLimit {
  fortuneTellerId: string
  fortuneTellerName: string
  currentCount: number
  remainingCount: number
}

async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const supabase = createAdminClient()

  // auth.usersから基本情報を取得
  const { data: authUser, error: authError } =
    await supabase.auth.admin.getUserById(userId)

  if (authError || !authUser.user) {
    console.error('Error fetching auth user:', authError)
    return null
  }

  // profilesからプロフィール情報を取得
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'nickname, birth_date, gender, concern_category, concern_description, partner_name, partner_gender, partner_birth_date'
    )
    .eq('id', userId)
    .single()

  // user_pointsからポイント情報を取得
  const { data: points } = await supabase
    .from('user_points')
    .select('points_balance')
    .eq('user_id', userId)
    .single()

  return {
    id: authUser.user.id,
    email: authUser.user.email || '',
    created_at: authUser.user.created_at,
    nickname: profile?.nickname || null,
    birth_date: profile?.birth_date || null,
    gender: profile?.gender || null,
    concern_category: profile?.concern_category || null,
    concern_description: profile?.concern_description || null,
    partner_name: profile?.partner_name || null,
    partner_gender: profile?.partner_gender || null,
    partner_birth_date: profile?.partner_birth_date || null,
    points_balance: points?.points_balance || 0,
  }
}

async function getDivinationHistory(
  userId: string
): Promise<DivinationHistory[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('divination_results')
    .select(
      `
      id,
      created_at,
      result_encrypted,
      points_consumed,
      fortune_teller:fortune_tellers!inner (
        name
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching divination history:', error)
    return []
  }

  return (data as any[]).map((item) => ({
    id: item.id,
    created_at: item.created_at,
    result_encrypted: item.result_encrypted,
    points_consumed: item.points_consumed,
    fortune_teller: item.fortune_teller,
  }))
}

async function getChatHistory(
  userId: string
): Promise<ChatHistoryByFortuneTeller[]> {
  const supabase = createAdminClient()

  // chat_messagesを取得
  const { data: messagesData, error: messagesError } = await supabase
    .from('chat_messages')
    .select(
      `
      id,
      created_at,
      sender_type,
      content,
      is_divination_request,
      divination_result_id,
      fortune_teller:fortune_tellers!inner (
        id,
        name
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (messagesError) {
    console.error('Error fetching chat messages:', messagesError)
    return []
  }

  // divination_resultsを取得
  const { data: divinationsData, error: divinationsError } = await supabase
    .from('divination_results')
    .select(
      `
      id,
      created_at,
      greeting_message,
      result_preview,
      result_encrypted,
      after_message,
      is_unlocked,
      fortune_teller:fortune_tellers!inner (
        id,
        name
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (divinationsError) {
    console.error('Error fetching divination results:', divinationsError)
  }

  // divination_result_idがあるメッセージのIDを収集
  const divinationResultIds = (messagesData as any[])
    .filter((item) => item.divination_result_id)
    .map((item) => item.divination_result_id)

  // 鑑定結果の開封状態を取得（メッセージ用）
  let divinationResults: { [key: string]: boolean } = {}
  if (divinationResultIds.length > 0) {
    const { data: resultsData } = await supabase
      .from('divination_results')
      .select('id, is_unlocked')
      .in('id', divinationResultIds)

    if (resultsData) {
      resultsData.forEach((result: any) => {
        divinationResults[result.id] = result.is_unlocked
      })
    }
  }

  // 占い師ごとにグループ化
  const groupedByFortuneTeller: { [key: string]: ChatHistoryByFortuneTeller } =
    {}

  // chat_messagesをグループ化
  ;(messagesData as any[]).forEach((item) => {
    const fortuneTellerId = item.fortune_teller.id
    const fortuneTellerName = item.fortune_teller.name

    if (!groupedByFortuneTeller[fortuneTellerId]) {
      groupedByFortuneTeller[fortuneTellerId] = {
        fortuneTellerId,
        fortuneTellerName,
        messages: [],
      }
    }

    groupedByFortuneTeller[fortuneTellerId].messages.push({
      id: item.id,
      created_at: item.created_at,
      sender_type: item.sender_type,
      content: item.content,
      is_divination_request: item.is_divination_request,
      is_unlocked: item.divination_result_id
        ? divinationResults[item.divination_result_id] ?? null
        : null,
      type: 'message',
      fortune_teller: item.fortune_teller,
    })
  })

  // divination_resultsをグループ化（鑑定結果本文として追加）
  if (divinationsData) {
    ;(divinationsData as any[]).forEach((item) => {
      const fortuneTellerId = item.fortune_teller.id
      const fortuneTellerName = item.fortune_teller.name

      if (!groupedByFortuneTeller[fortuneTellerId]) {
        groupedByFortuneTeller[fortuneTellerId] = {
          fortuneTellerId,
          fortuneTellerName,
          messages: [],
        }
      }

      // 鑑定結果を追加（開封済みなら全文、未開封ならプレビューのみ）
      groupedByFortuneTeller[fortuneTellerId].messages.push({
        id: item.id,
        created_at: item.created_at,
        sender_type: 'fortune_teller',
        content: item.is_unlocked ? item.result_encrypted : item.result_preview,
        is_divination_request: false,
        is_unlocked: item.is_unlocked,
        type: 'divination',
        fortune_teller: item.fortune_teller,
      })
    })
  }

  // 各占い師のメッセージを時系列順にソート
  Object.values(groupedByFortuneTeller).forEach((group) => {
    group.messages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })

  return Object.values(groupedByFortuneTeller)
}

async function getMessageLimits(userId: string): Promise<MessageLimit[]> {
  const supabase = createAdminClient()
  const today = new Date().toISOString().split('T')[0]

  // 今日のメッセージ制限を取得
  const { data: limits, error } = await supabase
    .from('message_limits')
    .select(
      `
      message_count,
      fortune_teller:fortune_tellers!inner (
        id,
        name
      )
    `
    )
    .eq('user_id', userId)
    .eq('target_date', today)

  if (error) {
    console.error('Error fetching message limits:', error)
    return []
  }

  if (!limits || limits.length === 0) {
    return []
  }

  return (limits as any[]).map((limit) => ({
    fortuneTellerId: limit.fortune_teller.id,
    fortuneTellerName: limit.fortune_teller.name,
    currentCount: limit.message_count,
    remainingCount: Math.max(0, MAX_MESSAGES_PER_DAY - limit.message_count),
  }))
}

interface PageProps {
  params: { id: string }
}

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UserDetailPage({ params }: PageProps) {
  const user = await getUserDetail(params.id)

  if (!user) {
    notFound()
  }

  const divinationHistory = await getDivinationHistory(params.id)
  const chatHistory = await getChatHistory(params.id)
  const messageLimits = await getMessageLimits(params.id)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/users"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              ユーザー詳細
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {user.nickname || '名前未設定'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左カラム：タブコンテンツ */}
        <div className="lg:col-span-2">
          <UserDetailTabs
            user={user}
            divinationHistory={divinationHistory}
            chatHistory={chatHistory}
          />
        </div>

        {/* 右カラム：ポイント管理・メッセージ制限管理 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                ポイント残高
              </h2>
            </div>
            <p className="text-4xl font-bold">{user.points_balance.toLocaleString()}</p>
            <p className="text-purple-100 text-sm mt-1">pt</p>
          </div>

          <PointManagement userId={params.id} currentPoints={user.points_balance} />

          <MessageLimitResetWrapper
            userId={params.id}
            messageLimits={messageLimits}
          />
        </div>
      </div>
    </div>
  )
}
