import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'

/**
 * 管理画面404 Not Foundページ
 *
 * 管理画面で存在しないページにアクセスした際に表示されます
 */
export default function AdminNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 404カード */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* 404アイコン */}
          <div className="flex justify-center mb-6">
            <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-500 to-indigo-600">
              404
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
            ページが見つかりません
          </h1>

          {/* メッセージ */}
          <p className="text-gray-600 text-center mb-8">
            お探しのページは存在しないか、
            <br />
            移動または削除された可能性があります。
          </p>

          {/* アクションボタン */}
          <div className="flex flex-col gap-3">
            <Link
              href="/admin"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              <span>ダッシュボードに戻る</span>
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>トップページに戻る</span>
            </Link>
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
