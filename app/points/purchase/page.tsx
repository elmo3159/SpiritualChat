import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PointsPurchaseClient from './PointsPurchaseClient'
import Image from 'next/image'

/**
 * ポイント購入ページ
 *
 * 複数のポイントプランをカード形式で表示し、購入できます
 */
export default async function PointsPurchasePage() {
  const supabase = await createClient()

  // 認証チェック（未認証でもページは表示する）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 現在のポイント残高を取得（認証済みユーザーのみ）
  let currentBalance = 0
  if (user) {
    const { data: userPoints } = await supabase
      .from('user_points')
      .select('points_balance')
      .eq('user_id', user.id)
      .single()

    currentBalance = userPoints?.points_balance || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-28">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>戻る</span>
          </Link>

          <div className="mb-4 flex justify-center md:justify-start">
            <Image
              src="/images/logo.png?v=2"
              alt="スピチャ"
              width={240}
              height={84}
              className="w-auto h-16"
              priority
            />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            ポイント購入
          </h1>
          <p className="text-gray-600">
            まとめて購入するほどお得になります
          </p>

          {/* 現在のポイント残高（認証済みユーザーのみ表示） */}
          {user && (
            <div className="mt-4 inline-block px-4 py-2 bg-purple-100 rounded-lg">
              <p className="text-purple-900 font-semibold">
                現在の残高: {currentBalance.toLocaleString()}ポイント
              </p>
            </div>
          )}
        </div>

        {/* クライアントコンポーネント（クーポン入力とプラン一覧） */}
        <PointsPurchaseClient />

        {/* セキュリティ情報 */}
        <div className="mt-12 text-center">
          <div className="inline-block px-6 py-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              🔒 決済はStripeによって安全に処理されます
            </p>
            <p className="text-xs text-gray-500 mt-1">
              クレジットカード情報は当サイトには保存されません
            </p>
          </div>
        </div>

        {/* 法的情報リンク */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/legal/tokusho"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              特定商取引法に基づく表記
            </Link>
            <Link
              href="/privacy"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              プライバシーポリシー
            </Link>
            <Link
              href="/terms"
              className="text-purple-600 hover:text-purple-700 underline"
            >
              利用規約
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
