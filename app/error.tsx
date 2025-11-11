'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

/**
 * グローバルエラーページ
 *
 * アプリケーション全体でキャッチされないエラーを表示します
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // エラーをコンソールに記録
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-purple to-spiritual-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* エラーカード */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-spiritual-lavender/30 p-8">
          {/* アイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            エラーが発生しました
          </h1>

          {/* メッセージ */}
          <p className="text-spiritual-lavender text-center mb-8">
            申し訳ございません。予期しないエラーが発生しました。
            <br />
            もう一度お試しください。
          </p>

          {/* エラー詳細（開発環境のみ） */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-black/30 rounded-lg">
              <p className="text-xs text-red-300 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-gray-400 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-spiritual-dark font-bold rounded-xl shadow-lg hover:shadow-spiritual-gold/50 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5" />
              <span>もう一度試す</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-spiritual-lavender/20 hover:bg-spiritual-lavender/30 text-white font-semibold rounded-xl transition-all duration-300 border border-spiritual-lavender/30"
            >
              <Home className="w-5 h-5" />
              <span>ホームに戻る</span>
            </button>
          </div>
        </div>

        {/* サポート情報 */}
        <p className="text-center text-spiritual-lavender/60 text-sm mt-6">
          問題が解決しない場合は、お手数ですがサポートまでお問い合わせください。
        </p>
      </div>
    </div>
  )
}
