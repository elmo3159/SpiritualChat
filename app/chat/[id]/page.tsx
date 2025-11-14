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
    <div className="h-[100vh] h-[100dvh] flex flex-col relative overflow-hidden">
      {/* 星空グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#1e1b4b] -z-10" />

      {/* 星のレイヤー */}
      <div className="absolute inset-0 -z-10">
        {/* 明滅する星（大） */}
        <div className="absolute top-[10%] left-[15%] w-2 h-2 bg-white rounded-full opacity-80 animate-twinkle" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[25%] right-[20%] w-2 h-2 bg-white rounded-full opacity-70 animate-twinkle" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[60%] left-[25%] w-2 h-2 bg-white rounded-full opacity-75 animate-twinkle" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] right-[30%] w-2 h-2 bg-white rounded-full opacity-80 animate-twinkle" style={{ animationDelay: '1.5s' }} />

        {/* 明滅する星（中） */}
        <div className="absolute top-[15%] left-[40%] w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-twinkle" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-[35%] right-[15%] w-1.5 h-1.5 bg-white rounded-full opacity-65 animate-twinkle" style={{ animationDelay: '2.5s' }} />
        <div className="absolute top-[70%] left-[60%] w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-twinkle" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-[30%] left-[10%] w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-twinkle" style={{ animationDelay: '1.8s' }} />

        {/* 静的な星（小） */}
        <div className="absolute top-[20%] left-[70%] w-1 h-1 bg-white rounded-full opacity-40" />
        <div className="absolute top-[45%] left-[80%] w-1 h-1 bg-white rounded-full opacity-30" />
        <div className="absolute top-[55%] right-[25%] w-1 h-1 bg-white rounded-full opacity-35" />
        <div className="absolute bottom-[25%] right-[10%] w-1 h-1 bg-white rounded-full opacity-40" />
        <div className="absolute top-[30%] left-[5%] w-1 h-1 bg-white rounded-full opacity-30" />
        <div className="absolute top-[50%] left-[50%] w-1 h-1 bg-white rounded-full opacity-35" />
        <div className="absolute bottom-[40%] left-[35%] w-1 h-1 bg-white rounded-full opacity-30" />
        <div className="absolute bottom-[15%] left-[55%] w-1 h-1 bg-white rounded-full opacity-40" />
        <div className="absolute top-[40%] right-[45%] w-1 h-1 bg-white rounded-full opacity-30" />
        <div className="absolute bottom-[35%] right-[60%] w-1 h-1 bg-white rounded-full opacity-35" />

        {/* さらに小さい星（極小） */}
        <div className="absolute top-[12%] left-[30%] w-0.5 h-0.5 bg-white rounded-full opacity-25" />
        <div className="absolute top-[38%] left-[45%] w-0.5 h-0.5 bg-white rounded-full opacity-20" />
        <div className="absolute top-[65%] right-[40%] w-0.5 h-0.5 bg-white rounded-full opacity-25" />
        <div className="absolute bottom-[45%] right-[5%] w-0.5 h-0.5 bg-white rounded-full opacity-20" />
        <div className="absolute top-[75%] left-[20%] w-0.5 h-0.5 bg-white rounded-full opacity-25" />
        <div className="absolute bottom-[10%] left-[40%] w-0.5 h-0.5 bg-white rounded-full opacity-20" />
      </div>

      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-[#1e1b4b]/80 backdrop-blur-md shadow-sm border-b border-purple-500/20">
        <div className="flex items-center gap-4 px-4 py-3 max-w-3xl mx-auto">
          {/* 戻るボタン */}
          <Link
            href="/"
            className="flex-shrink-0 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>

          {/* 占い師情報 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-spiritual-gold/50">
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
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-[#1e1b4b]" />
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-white truncate">
                {fortuneTeller.name}
              </h1>
              <p className="text-xs text-spiritual-gold truncate">
                {fortuneTeller.title}
              </p>
            </div>
          </div>

          {/* メニューボタン */}
          <ChatHeaderMenu fortuneTellerId={params.id} />
        </div>
      </header>

      {/* チャットエリア */}
      <div className="flex-1 overflow-hidden">
        <ChatContainer
          key={params.id}
          initialMessages={initialMessages}
          fortuneTellerId={params.id}
          fortuneTellerName={fortuneTeller.name}
          fortuneTellerAvatar={fortuneTeller.avatar_url}
        />
      </div>
    </div>
  )
}
