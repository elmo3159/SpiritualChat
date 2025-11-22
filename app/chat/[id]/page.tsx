import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ChatContainer from '@/app/components/chat/ChatContainer'
import ChatHeaderMenu from '@/app/components/chat/ChatHeaderMenu'
import type { FortuneTeller } from '@/lib/types/fortune-teller'
import type { ChatMessageDisplay } from '@/lib/types/chat'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: {
    id: string
  }
}

/**
 * チャットページ
 *
 * 指定された占い師とのチャット画面を表示します
 */
export default async function ChatPage({ params }: Props) {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 占い師情報を取得
  const { data: fortuneTeller, error: fortuneTellerError } = await supabase
    .from('fortune_tellers')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (fortuneTellerError || !fortuneTeller) {
    notFound()
  }

  // チャットメッセージを取得
  const { data: messages, error: messagesError } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', user.id)
    .eq('fortune_teller_id', params.id)
    .order('created_at', { ascending: true })
    .limit(100)

  if (messagesError) {
    console.error('メッセージ取得エラー:', messagesError)
  }

  // メッセージをChatMessageDisplay形式に変換
  const initialMessages: ChatMessageDisplay[] =
    messages?.map((msg) => ({
      id: msg.id,
      content: msg.content,
      sender_type: msg.sender_type as 'user' | 'fortune_teller',
      created_at: msg.created_at,
      sender_name: msg.sender_type === 'fortune_teller' ? fortuneTeller.name : undefined,
      sender_avatar:
        msg.sender_type === 'fortune_teller' ? fortuneTeller.avatar_url : undefined,
    })) || []

  return (
    <div className="h-[100vh] h-[100dvh] flex flex-col relative">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: 'url(/images/BackGround.jpeg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      />

      {/* マスコット装飾 */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/images/mascot3.png"
          alt=""
          width={80}
          height={80}
          className="absolute top-20 left-4 w-16 opacity-40"
        />
        <Image
          src="/images/mascot4.png"
          alt=""
          width={80}
          height={80}
          className="absolute bottom-32 right-4 w-16 opacity-40"
        />
      </div>

      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-spiritual-pink/90 backdrop-blur-md shadow-sm border-b border-spiritual-pink-dark/30">
        <div className="flex items-center gap-4 px-4 py-2 pt-safe-top max-w-3xl mx-auto">
          {/* 戻るボタン */}
          <Link
            href="/fortune-tellers"
            className="flex-shrink-0 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          {/* 占い師情報 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50">
                <Image
                  src={fortuneTeller.avatar_url || '/images/default-avatar.png'}
                  alt={fortuneTeller.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              {/* オンライン状態 */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-spiritual-pink" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-white truncate">
                {fortuneTeller.name}
              </h1>
              <p className="text-xs text-white/90 truncate">
                {fortuneTeller.title}
              </p>
            </div>
          </div>

          {/* メニューボタン */}
          <ChatHeaderMenu fortuneTellerId={params.id} />
        </div>
      </header>

      {/* チャットエリア */}
      <ChatContainer
        key={params.id}
        initialMessages={initialMessages}
        fortuneTellerId={params.id}
        fortuneTellerName={fortuneTeller.name}
        fortuneTellerAvatar={fortuneTeller.avatar_url}
      />
    </div>
  )
}
