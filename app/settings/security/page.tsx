'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, AlertTriangle, Monitor, Calendar } from 'lucide-react'

interface LoginHistory {
  id: string
  ip_address: string
  user_agent: string
  login_at: string
  is_suspicious: boolean
}

/**
 * セキュリティ・ログイン履歴ページ
 *
 * ユーザーのログイン履歴と不審なアクティビティを表示
 */
export default function SecurityPage() {
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const response = await fetch('/api/security/login-history')
        if (response.ok) {
          const data = await response.json()
          setLoginHistory(data.loginHistory || [])
        }
      } catch (error) {
        console.error('ログイン履歴取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLoginHistory()
  }, [])

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`
    return date.toLocaleDateString('ja-JP')
  }

  const suspiciousCount = loginHistory.filter(h => h.is_suspicious).length

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-lavender/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 hover:bg-spiritual-light/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              セキュリティ
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 総ログイン数 */}
          <div className="bg-gradient-to-br from-spiritual-darker/80 to-spiritual-dark/80 backdrop-blur-sm rounded-2xl border border-spiritual-lavender/30 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">総ログイン数</p>
                <p className="text-3xl font-bold text-spiritual-gold">
                  {loginHistory.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">過去50件</p>
              </div>
              <div className="p-4 bg-spiritual-gold/20 rounded-full">
                <Shield className="w-8 h-8 text-spiritual-gold" />
              </div>
            </div>
          </div>

          {/* 不審なアクティビティ */}
          <div
            className={`bg-gradient-to-br backdrop-blur-sm rounded-2xl border p-6 shadow-xl ${
              suspiciousCount > 0
                ? 'from-red-900/50 to-red-800/50 border-red-500/50'
                : 'from-spiritual-darker/80 to-spiritual-dark/80 border-spiritual-lavender/30'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">不審なアクティビティ</p>
                <p
                  className={`text-3xl font-bold ${
                    suspiciousCount > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                >
                  {suspiciousCount}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {suspiciousCount > 0 ? '要注意' : '問題なし'}
                </p>
              </div>
              <div
                className={`p-4 rounded-full ${
                  suspiciousCount > 0 ? 'bg-red-500/20' : 'bg-green-500/20'
                }`}
              >
                <AlertTriangle
                  className={`w-8 h-8 ${
                    suspiciousCount > 0 ? 'text-red-400' : 'text-green-400'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ログイン履歴 */}
        <div className="bg-spiritual-darker/50 backdrop-blur-sm rounded-2xl border border-spiritual-lavender/20 overflow-hidden shadow-xl">
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2 className="text-lg font-semibold text-spiritual-gold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              ログイン履歴
            </h2>
          </div>

          <div className="divide-y divide-spiritual-lavender/10">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-spiritual-gold border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 mt-4">読み込み中...</p>
              </div>
            ) : loginHistory.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">ログイン履歴がありません</p>
              </div>
            ) : (
              loginHistory.map((history) => (
                <div
                  key={history.id}
                  className={`p-5 hover:bg-spiritual-light/10 transition-colors ${
                    history.is_suspicious ? 'bg-red-900/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* アイコン */}
                    <div
                      className={`p-3 rounded-full ${
                        history.is_suspicious
                          ? 'bg-red-500/20'
                          : 'bg-spiritual-accent/20'
                      }`}
                    >
                      {history.is_suspicious ? (
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                      ) : (
                        <Shield className="w-5 h-5 text-spiritual-accent" />
                      )}
                    </div>

                    {/* 詳細情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="text-base font-semibold text-white">
                            {history.is_suspicious
                              ? '不審なログイン'
                              : '通常のログイン'}
                          </p>
                          <p className="text-sm text-gray-400">
                            {getRelativeTime(history.login_at)}
                          </p>
                        </div>
                        {history.is_suspicious && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">
                            要注意
                          </span>
                        )}
                      </div>

                      {/* IPアドレス */}
                      {history.ip_address && (
                        <div className="flex items-center gap-2 text-sm text-gray-300 mb-1">
                          <Monitor className="w-4 h-4 text-gray-500" />
                          <span>IP: {history.ip_address}</span>
                        </div>
                      )}

                      {/* ユーザーエージェント */}
                      {history.user_agent && (
                        <div className="flex items-start gap-2 text-sm text-gray-300">
                          <Monitor className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="break-all line-clamp-2">{history.user_agent}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* セキュリティヒント */}
        <div className="mt-6 bg-gradient-to-br from-spiritual-accent/20 to-spiritual-gold/20 backdrop-blur-sm rounded-2xl border border-spiritual-gold/30 p-6">
          <h3 className="text-base font-semibold text-spiritual-gold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            セキュリティのヒント
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-spiritual-gold mt-1">•</span>
              <span>
                不審なログインを発見した場合は、すぐにパスワードを変更してください
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-spiritual-gold mt-1">•</span>
              <span>定期的にパスワードを変更することをお勧めします</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-spiritual-gold mt-1">•</span>
              <span>
                公共のWi-Fiを使用する際は、VPNの使用を検討してください
              </span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
