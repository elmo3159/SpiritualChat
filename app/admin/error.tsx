'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react'

/**
 * 管理画面エラーページ
 *
 * 管理画面でエラーが発生した際に表示されます
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // エラーをコンソールに記録
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* エラーカード */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            エラーが発生しました
          </h1>

          {/* メッセージ */}
          <p className="text-gray-600 text-center mb-8">
            申し訳ございません。予期しないエラーが発生しました。
            <br />
            操作をもう一度お試しください。
          </p>

          {/* エラー詳細（開発環境のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-500 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                    スタックトレース
                  </summary>
                  <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              <span>もう一度試す</span>
            </button>

            <button
              onClick={() => router.push('/admin')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>ダッシュボードに戻る</span>
            </button>
          </div>
        </div>

        {/* サポート情報 */}
        <p className="text-center text-gray-500 text-sm mt-6">
          問題が解決しない場合は、システム管理者にお問い合わせください。
        </p>
      </div>
    </div>
  )
}
