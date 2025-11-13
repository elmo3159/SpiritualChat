'use client'

import { useState, useEffect, useRef } from 'react'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import DivinationButton from './DivinationButton'
import DivinationResult from './DivinationResult'
import TypingIndicator from './TypingIndicator'
import type { ChatMessageDisplay } from '@/lib/types/chat'
import type { DivinationResultDisplay } from '@/lib/types/divination'
import { Loader2 } from 'lucide-react'
import { sendMessage } from '@/app/actions/chat'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Props {
  initialMessages: ChatMessageDisplay[]
  fortuneTellerId: string
  fortuneTellerName: string
  fortuneTellerAvatar: string
}

interface InitialSuggestion {
  greeting: string
}

/**
 * チャットコンテナコンポーネント
 *
 * メッセージの表示と送信を管理します
 */
export default function ChatContainer({
  initialMessages,
  fortuneTellerId,
  fortuneTellerName,
  fortuneTellerAvatar,
}: Props) {
  const [messages, setMessages] = useState<ChatMessageDisplay[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialSuggestion, setInitialSuggestion] = useState<InitialSuggestion | null>(null)
  const [regeneratedSuggestion, setRegeneratedSuggestion] = useState<InitialSuggestion | null>(null)
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false)
  const [isRegeneratingSuggestion, setIsRegeneratingSuggestion] = useState(false)
  const [remainingMessageCount, setRemainingMessageCount] = useState<number>(3)
  const [divinations, setDivinations] = useState<DivinationResultDisplay[]>([])
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [userPoints, setUserPoints] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const hasFetchedSuggestion = useRef(false)
  const hasFetchedLimit = useRef(false)
  const hasFetchedDivinations = useRef(false)
  const fortuneTellerNameRef = useRef(fortuneTellerName)
  const fortuneTellerAvatarRef = useRef(fortuneTellerAvatar)
  const router = useRouter()

  // 占い師情報のrefを更新
  useEffect(() => {
    fortuneTellerNameRef.current = fortuneTellerName
    fortuneTellerAvatarRef.current = fortuneTellerAvatar
  }, [fortuneTellerName, fortuneTellerAvatar])

  // メッセージまたは鑑定結果が更新されたら自動スクロール
  useEffect(() => {
    scrollToBottom()
  }, [messages, divinations])

  // Supabase Realtimeでメッセージをリアルタイム受信
  useEffect(() => {
    const supabase = createClient()
    let currentUserId: string | null = null

    // 既に購読済みの場合は何もしない（多重購読を防ぐ）
    if (channelRef.current?.state === ('subscribed' as any)) {
      console.log('既にRealtime購読済みのためスキップ')
      return
    }

    // ユーザーIDを取得してからリアルタイム監視を開始
    const setupRealtimeSubscription = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          console.error('[Realtime] ユーザーが認証されていません')
          return
        }

        currentUserId = user.id
        console.log('[Realtime] ユーザーID:', user.id)
        console.log('[Realtime] 占い師ID:', fortuneTellerId)

        // シンプルなチャンネル名を使用
        const channelName = `chat_${fortuneTellerId}_${user.id}`
        console.log('[Realtime] チャンネル名:', channelName)

        const channel = supabase.channel(channelName, {
          config: {
            broadcast: { self: false },
            presence: { key: user.id },
          },
        })
      channelRef.current = channel

      // chat_messagesテーブルのINSERTイベントを監視
      channel
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `fortune_teller_id=eq.${fortuneTellerId}`,
          },
          (payload) => {
            // 自分のメッセージのみ処理
            if (payload.new.user_id !== currentUserId) {
              return
            }

            console.log('リアルタイムメッセージ受信:', payload)

            // 新しいメッセージをChatMessageDisplay形式に変換
            const newMessage: ChatMessageDisplay = {
              id: payload.new.id,
              content: payload.new.content,
              sender_type: payload.new.sender_type,
              created_at: payload.new.created_at,
              sender_name:
                payload.new.sender_type === 'fortune_teller'
                  ? fortuneTellerNameRef.current
                  : undefined,
              sender_avatar:
                payload.new.sender_type === 'fortune_teller'
                  ? fortuneTellerAvatarRef.current
                  : undefined,
            }

            // メッセージを遅延表示（占い師からのメッセージのみ）
            if (payload.new.sender_type === 'fortune_teller') {
              // 1秒の遅延を入れてリアルタイム感を演出
              setTimeout(() => {
                // 既に存在するメッセージでないか確認（重複防止）
                setMessages((prev) => {
                  const exists = prev.some((msg) => msg.id === newMessage.id)
                  if (exists) {
                    return prev
                  }
                  return [...prev, newMessage]
                })
                setIsLoading(false)
              }, 1000)
            } else {
              // ユーザーメッセージは即座に表示
              setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === newMessage.id)
                if (exists) {
                  return prev
                }
                return [...prev, newMessage]
              })
            }
          }
        )
        // divination_resultsテーブルのINSERTイベントも監視
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'divination_results',
            filter: `fortune_teller_id=eq.${fortuneTellerId}`,
          },
          (payload) => {
            // 自分の鑑定結果のみ処理
            if (payload.new.user_id !== currentUserId) {
              return
            }

            console.log('リアルタイム鑑定結果受信:', payload)

            // 新しい鑑定結果をDivinationResultDisplay形式に変換
            const newDivination: DivinationResultDisplay = {
              id: payload.new.id,
              greetingMessage: payload.new.greeting_message,
              resultPreview: payload.new.result_preview,
              resultFull: payload.new.is_unlocked ? payload.new.result_encrypted : undefined,
              afterMessage: payload.new.after_message,
              isUnlocked: payload.new.is_unlocked,
              pointsConsumed: payload.new.points_consumed,
              unlockedAt: payload.new.unlocked_at,
              createdAt: payload.new.created_at,
            }

            // 2秒の遅延を入れて鑑定結果を表示（メッセージの後に来るように）
            setTimeout(() => {
              // 既に存在する鑑定結果でないか確認（重複防止）
              setDivinations((prev) => {
                const exists = prev.some((div) => div.id === newDivination.id)
                if (exists) {
                  return prev
                }
                return [...prev, newDivination]
              })
            }, 2000)
          }
        )
        .subscribe((status, err) => {
          console.log('[Realtime] 購読状態:', status)
          if (err) {
            console.error('[Realtime] 購読エラー:', err)
          }

          if (status === 'SUBSCRIBED') {
            console.log('[Realtime] 購読成功！')
          } else if (status === 'TIMED_OUT') {
            console.error('[Realtime] タイムアウト - 再試行が必要です')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('[Realtime] チャンネルエラー')
          } else if (status === 'CLOSED') {
            console.warn('[Realtime] チャンネルが閉じられました')
          }
        })
      } catch (error) {
        console.error('[Realtime] セットアップエラー:', error)
      }
    }

    setupRealtimeSubscription()

    // クリーンアップ: コンポーネントのアンマウント時にチャンネルを削除
    return () => {
      console.log('[Realtime] チャンネルをクリーンアップ')
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [fortuneTellerId])

  // 残りメッセージ送信回数を取得する共通関数
  const refetchMessageLimit = async () => {
    try {
      const response = await fetch(
        `/api/chat/message-limit?fortuneTellerId=${fortuneTellerId}`
      )

      const result = await response.json()

      if (result.success && result.data) {
        setRemainingMessageCount(result.data.remainingCount)
      }
    } catch (error) {
      console.error('メッセージ制限取得エラー:', error)
    }
  }

  // 残りメッセージ送信回数を取得
  useEffect(() => {
    const fetchMessageLimit = async () => {
      if (hasFetchedLimit.current) {
        return
      }

      hasFetchedLimit.current = true
      await refetchMessageLimit()
    }

    fetchMessageLimit()
  }, [fortuneTellerId])

  // 鑑定結果を取得
  useEffect(() => {
    const fetchDivinations = async () => {
      if (hasFetchedDivinations.current) {
        return
      }

      hasFetchedDivinations.current = true

      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('divination_results')
          .select('*')
          .eq('user_id', user.id)
          .eq('fortune_teller_id', fortuneTellerId)
          .order('created_at', { ascending: true })

        if (error) {
          console.error('鑑定結果取得エラー:', error)
          return
        }

        if (data) {
          const divinationDisplays: DivinationResultDisplay[] = data.map((d) => ({
            id: d.id,
            greetingMessage: d.greeting_message,
            resultPreview: d.result_preview,
            resultFull: d.is_unlocked ? d.result_encrypted : undefined,
            afterMessage: d.after_message,
            isUnlocked: d.is_unlocked,
            pointsConsumed: d.points_consumed,
            unlockedAt: d.unlocked_at,
            createdAt: d.created_at,
          }))
          setDivinations(divinationDisplays)
        }
      } catch (error) {
        console.error('鑑定結果取得エラー:', error)
      }
    }

    fetchDivinations()
  }, [fortuneTellerId])

  // ポイント残高を取得
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from('user_points')
          .select('points_balance')
          .eq('user_id', user.id)
          .single()

        if (error) {
          console.error('ポイント残高取得エラー:', error)
          return
        }

        if (data) {
          setUserPoints(data.points_balance || 0)
        }
      } catch (error) {
        console.error('ポイント残高取得エラー:', error)
      }
    }

    fetchUserPoints()
  }, [])

  // 初回提案を取得
  useEffect(() => {
    const fetchInitialSuggestion = async () => {
      // メッセージが既にある場合、または既に取得済みの場合はスキップ
      if (messages.length > 0 || hasFetchedSuggestion.current) {
        return
      }

      hasFetchedSuggestion.current = true
      setIsLoadingSuggestion(true)

      try {
        const response = await fetch('/api/chat/initial-suggestion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fortuneTellerId,
          }),
        })

        const result = await response.json()

        if (result.success && result.data) {
          setInitialSuggestion(result.data)
        } else {
          console.error('初回提案の取得に失敗:', result.message)
        }
      } catch (error) {
        console.error('初回提案の取得エラー:', error)
      } finally {
        setIsLoadingSuggestion(false)
      }
    }

    fetchInitialSuggestion()
  }, [messages.length, fortuneTellerId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }


  const handleSendMessage = async (content: string) => {
    setIsLoading(true)
    setError(null)
    // 既存の提案をクリア
    setRegeneratedSuggestion(null)

    try {
      // 楽観的UIアップデート: ユーザーメッセージを即座に表示
      const tempUserMessage: ChatMessageDisplay = {
        id: `temp-${Date.now()}`,
        content,
        sender_type: 'user',
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, tempUserMessage])

      // Server Actionでメッセージを送信
      const result = await sendMessage(fortuneTellerId, content)

      if (!result.success) {
        // エラーの場合、楽観的に追加したメッセージを削除
        setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id))
        setError(result.message || 'メッセージの送信に失敗しました')
        setIsLoading(false)
        return
      }

      // 成功した場合、tempメッセージを実際のIDで更新
      // Realtimeで既に同じメッセージが追加されている可能性があるため、重複チェック
      setMessages((prev) => {
        const actualId = result.data!.id
        const exists = prev.some((msg) => msg.id === actualId && msg.id !== tempUserMessage.id)

        if (exists) {
          // 実際のメッセージが既に存在する場合、tempメッセージを削除
          return prev.filter((msg) => msg.id !== tempUserMessage.id)
        } else {
          // tempメッセージを実際のIDに更新
          return prev.map((msg) =>
            msg.id === tempUserMessage.id
              ? { ...msg, id: actualId, created_at: result.data!.created_at }
              : msg
          )
        }
      })

      // 残りメッセージ送信回数を更新
      if (result.remainingCount !== undefined) {
        setRemainingMessageCount(result.remainingCount)
      }

      // メッセージ送信後、AI応答は sendMessage 内で自動生成されるため、
      // ここで regenerateSuggestions を呼ぶ必要はありません
      // isLoadingは、AI応答がRealtimeで届いた時点でfalseになります
    } catch (error) {
      console.error('メッセージ送信エラー:', error)
      setError('予期しないエラーが発生しました')
      setIsLoading(false)
    }
  }

  // 提案再生成関数
  const regenerateSuggestions = async (latestMessageContent: string) => {
    setIsRegeneratingSuggestion(true)

    try {
      const response = await fetch('/api/chat/regenerate-suggestion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fortuneTellerId,
          latestMessageContent,
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        setRegeneratedSuggestion(result.data)
      } else {
        console.error('提案再生成に失敗:', result.message)
      }
    } catch (error) {
      console.error('提案再生成エラー:', error)
    } finally {
      setIsRegeneratingSuggestion(false)
    }
  }

  // 鑑定生成成功時のコールバック
  const handleDivinationGenerated = async (divinationId: string) => {
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // 新しく生成された鑑定結果を取得
      const { data, error } = await supabase
        .from('divination_results')
        .select('*')
        .eq('id', divinationId)
        .single()

      if (error || !data) {
        console.error('鑑定結果取得エラー:', error)
        return
      }

      // DivinationResultDisplay形式に変換
      const newDivination: DivinationResultDisplay = {
        id: data.id,
        greetingMessage: data.greeting_message,
        resultPreview: data.result_preview,
        resultFull: data.is_unlocked ? data.result_encrypted : undefined,
        afterMessage: data.after_message,
        isUnlocked: data.is_unlocked,
        pointsConsumed: data.points_consumed,
        unlockedAt: data.unlocked_at,
        createdAt: data.created_at,
      }

      // 鑑定結果リストに追加
      setDivinations((prev) => [...prev, newDivination])
    } catch (error) {
      console.error('鑑定結果追加エラー:', error)
    }
  }

  // 鑑定結果開封時のコールバック
  const handleUnlock = async (divinationId: string) => {
    setIsUnlocking(true)

    try {
      const response = await fetch('/api/divination/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          divinationId,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        // ポイント不足の場合、ポイント購入ページに遷移
        if (result.message === 'ポイントが不足しています') {
          router.push('/points/purchase')
          return
        }
        setError(result.message || '鑑定結果の開封に失敗しました')
        setIsUnlocking(false)
        return
      }

      if (result.data) {
        // 鑑定結果を更新（開封済みとして表示）
        setDivinations((prev) =>
          prev.map((d) =>
            d.id === divinationId
              ? {
                  ...d,
                  isUnlocked: true,
                  resultFull: result.data.resultFull,
                  pointsConsumed: result.data.pointsConsumed,
                }
              : d
          )
        )

        // メッセージ送信回数制限をリセットしたのでUIを更新
        await refetchMessageLimit()
      }

      setIsUnlocking(false)
    } catch (error) {
      console.error('鑑定結果開封エラー:', error)
      setError('予期しないエラーが発生しました')
      setIsUnlocking(false)
    }
  }

  // メッセージと鑑定結果を時系列順に統合
  const combinedItems = [
    ...messages.map((msg) => ({
      type: 'message' as const,
      data: msg,
      createdAt: msg.created_at,
    })),
    ...divinations.map((div) => ({
      type: 'divination' as const,
      data: div,
      createdAt: div.createdAt,
    })),
  ].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

  return (
    <div className="flex flex-col h-full">
      {/* メッセージ一覧エリア */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {combinedItems.length === 0 ? (
            <div className="space-y-6">
              {/* 初回提案ローディング */}
              {isLoadingSuggestion && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <p className="text-gray-500 text-sm">
                    {fortuneTellerName}があなたのための提案を考えています...
                  </p>
                </div>
              )}

              {/* 初回提案表示 */}
              {!isLoadingSuggestion && initialSuggestion && (
                <div className="space-y-4">
                  {/* 占い師からの提案メッセージ */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-spiritual-lavender/50 shadow-lg bg-spiritual-purple/20">
                        <img
                          src={fortuneTellerAvatar}
                          alt={fortuneTellerName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-spiritual-lavender/90 to-spiritual-lavender-light/90 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-lg border border-spiritual-lavender/30 hover:shadow-xl transition-all duration-200">
                        <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {initialSuggestion.greeting}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 提案なし・ローディング終了後 */}
              {!isLoadingSuggestion && !initialSuggestion && (
                <div className="text-center py-16">
                  <p className="text-gray-500">
                    まだメッセージがありません
                    <br />
                    最初のメッセージを送信してみましょう
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {combinedItems.map((item) => {
                if (item.type === 'message') {
                  return <MessageBubble key={item.data.id} message={item.data} />
                } else {
                  return (
                    <DivinationResult
                      key={item.data.id}
                      divination={item.data}
                      onUnlock={handleUnlock}
                      isUnlocking={isUnlocking}
                      userPoints={userPoints}
                    />
                  )
                }
              })}

              {/* 占い師が入力中インジケーター */}
              {isLoading && (
                <TypingIndicator
                  fortuneTellerName={fortuneTellerName}
                  fortuneTellerAvatar={fortuneTellerAvatar}
                />
              )}

              {/* 提案再生成ローディング */}
              {isRegeneratingSuggestion && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                  <p className="text-gray-500 text-sm">
                    {fortuneTellerName}が新しい提案を考えています...
                  </p>
                </div>
              )}

              {/* 再生成された提案表示 */}
              {!isRegeneratingSuggestion && regeneratedSuggestion && (
                <div className="space-y-4 mt-6">
                  {/* 占い師からの提案メッセージ */}
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-spiritual-lavender/50 shadow-lg bg-spiritual-purple/20">
                        <img
                          src={fortuneTellerAvatar}
                          alt={fortuneTellerName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-br from-spiritual-lavender/90 to-spiritual-lavender-light/90 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-lg border border-spiritual-lavender/30 hover:shadow-xl transition-all duration-200">
                        <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">
                          {regeneratedSuggestion.greeting}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 border-t border-red-700/50 backdrop-blur-sm">
          <p className="text-sm text-red-300 text-center">{error}</p>
        </div>
      )}

      {/* 制限に達した時のみ表示 */}
      {remainingMessageCount <= 0 && (
        <div className="px-4 py-2 bg-red-900/50 backdrop-blur-md border-t border-red-700/50">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs md:text-sm text-red-300 text-center font-semibold">
              本日の送信回数制限（3回）に達しました。鑑定結果を開封するか、明日再度お試しください。
            </p>
          </div>
        </div>
      )}

      {/* 占ってもらうボタン */}
      <div className="px-4 py-2 bg-spiritual-dark/95 backdrop-blur-lg border-t border-spiritual-purple/30 shadow-lg">
        <div className="max-w-3xl mx-auto">
          <DivinationButton
            fortuneTellerId={fortuneTellerId}
            onDivinationGenerated={handleDivinationGenerated}
          />
        </div>
      </div>

      {/* メッセージ入力エリア */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={isLoading || remainingMessageCount <= 0}
        placeholder={
          remainingMessageCount > 0
            ? '占ってほしい内容を指定 or\n追加情報を教えて改めて提案してもらう'
            : '本日の送信回数制限に達しました'
        }
      />
    </div>
  )
}
