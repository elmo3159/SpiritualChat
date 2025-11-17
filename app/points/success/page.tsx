import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { CheckCircle, Sparkles } from 'lucide-react'
import TikTokPurchaseTracker from './TikTokPurchaseTracker'

interface PageProps {
  searchParams: {
    session_id?: string
  }
}

/**
 * ポイント購入成功ページ
 *
 * Stripe Checkoutからリダイレクトされ、購入完了を表示します
 */
export default async function PointsSuccessPage({
  searchParams,
}: PageProps) {
  const sessionId = searchParams.session_id

  if (!sessionId) {
    redirect('/points/purchase')
  }

  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Stripeセッション情報を取得
  const stripe = getStripeClient()
  let session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (error) {
    console.error('セッション取得エラー:', error)
    redirect('/points/purchase')
  }

  // メタデータから購入情報を取得
  const points = parseInt(session.metadata?.points || '0')
  const planId = session.metadata?.planId || ''

  // 現在のポイント残高を取得
  const { data: userPoints } = await supabase
    .from('user_points')
    .select('points_balance')
    .eq('user_id', user.id)
    .single()

  const currentBalance = userPoints?.points_balance || 0

  // 購入金額を取得（セントから円に変換）
  const purchaseAmount = session.amount_total ? session.amount_total / 100 : 0

  return (
    <>
      {/* TikTok購入イベントトラッカー */}
      <TikTokPurchaseTracker amount={purchaseAmount} />
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 成功アニメーション */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-2xl mb-6 animate-bounce">
            <CheckCircle className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            購入完了！
          </h1>
          <p className="text-gray-600">
            ポイントの購入が正常に完了しました
          </p>
        </div>

        {/* 購入情報カード */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {/* 購入したポイント */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2">購入ポイント</p>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              <p className="text-4xl font-bold text-purple-600">
                +{points.toLocaleString()}
              </p>
              <span className="text-lg text-gray-600">pt</span>
            </div>
          </div>

          {/* 現在の残高 */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">現在の残高</p>
            <p className="text-3xl font-bold text-gray-900">
              {currentBalance.toLocaleString()}
              <span className="text-lg text-gray-600 ml-1">ポイント</span>
            </p>
          </div>
        </div>

        {/* 決済情報 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            決済情報
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">決済ID</span>
              <span className="text-gray-900 font-mono text-xs">
                {sessionId.substring(0, 20)}...
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">プラン</span>
              <span className="text-gray-900">{planId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">支払い方法</span>
              <span className="text-gray-900">クレジットカード</span>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 text-center"
          >
            占い師と話す
          </Link>

          <Link
            href="/points/purchase"
            className="block w-full px-6 py-4 bg-white text-purple-600 font-semibold rounded-xl border-2 border-purple-200 hover:border-purple-300 transition-all duration-200 text-center"
          >
            さらにポイントを追加
          </Link>
        </div>

        {/* お知らせ */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            ポイントは即座にアカウントに反映されます
          </p>
          <p className="text-xs text-gray-500 mt-1">
            領収書はご登録のメールアドレスに送信されました
          </p>
        </div>
      </div>
    </div>
    </>
  )
}
