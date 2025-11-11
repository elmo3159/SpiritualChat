import Link from 'next/link'
import { Home, Search } from 'lucide-react'

/**
 * 404 Not Foundページ
 *
 * 存在しないページにアクセスした際に表示されます
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-purple to-spiritual-dark flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* 404カード */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-spiritual-lavender/30 p-8">
          {/* 404アイコン */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-spiritual-gold to-spiritual-accent">
                404
              </div>
              <div className="absolute inset-0 blur-lg opacity-50">
                <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-spiritual-gold to-spiritual-accent">
                  404
                </div>
              </div>
            </div>
          </div>

          {/* タイトル */}
          <h1 className="text-2xl font-bold text-white text-center mb-4">
            ページが見つかりません
          </h1>

          {/* メッセージ */}
          <p className="text-spiritual-lavender text-center mb-8">
            お探しのページは存在しないか、
            <br />
            移動または削除された可能性があります。
          </p>

          {/* アクションボタン */}
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-spiritual-gold to-spiritual-accent text-spiritual-dark font-bold rounded-xl shadow-lg hover:shadow-spiritual-gold/50 transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              <span>ホームに戻る</span>
            </Link>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-spiritual-lavender/20 hover:bg-spiritual-lavender/30 text-white font-semibold rounded-xl transition-all duration-300 border border-spiritual-lavender/30"
            >
              <Search className="w-5 h-5" />
              <span>占い師を探す</span>
            </Link>
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
