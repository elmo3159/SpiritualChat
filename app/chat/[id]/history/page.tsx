import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import DivinationHistoryList from '@/app/components/chat/DivinationHistoryList'
import type { DivinationResultDisplay } from '@/lib/types/divination'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  params: {
    id: string
  }
}

/**
 * 鑑定履歴ページ
 *
 * 指定された占い師との過去の鑑定結果を一覧表示します
 */
export default async function DivinationHistoryPage({ params }: Props) {
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

  // 鑑定結果を取得（日付降順）
  const { data: divinations, error: divinationsError } = await supabase
    .from('divination_results')
    .select('*')
    .eq('user_id', user.id)
    .eq('fortune_teller_id', params.id)
    .order('created_at', { ascending: false })

  if (divinationsError) {
    console.error('鑑定結果取得エラー:', divinationsError)
  }

  // DivinationResultDisplay形式に変換
  const divinationDisplays: DivinationResultDisplay[] =
    divinations?.map((d) => ({
      id: d.id,
      greetingMessage: d.greeting_message,
      resultPreview: d.result_preview,
      resultFull: d.is_unlocked ? d.result_encrypted : undefined,
      afterMessage: d.after_message,
      isUnlocked: d.is_unlocked,
      pointsConsumed: d.points_consumed,
      unlockedAt: d.unlocked_at,
      createdAt: d.created_at,
    })) || []

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-purple-100">
        <div className="flex items-center gap-4 px-4 py-3 max-w-3xl mx-auto">
          {/* 戻るボタン */}
          <Link
            href={`/chat/${params.id}`}
            className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </Link>

          {/* 占い師情報 */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200">
                <Image
                  src={fortuneTeller.avatar_url || '/images/default-avatar.png'}
                  alt={fortuneTeller.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-800 truncate">
                鑑定履歴
              </h1>
              <p className="text-xs text-gray-600 truncate">
                {fortuneTeller.name}との鑑定結果
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* 履歴リスト */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <DivinationHistoryList
          divinations={divinationDisplays}
          fortuneTellerId={params.id}
        />
      </div>
    </div>
  )
}
