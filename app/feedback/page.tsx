'use client'

import { useState } from 'react'
import { ArrowLeft, MessageSquare, Bug, Lightbulb, Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * フィードバック投稿ページ
 *
 * 一般的なフィードバック、バグ報告、機能リクエスト、NPSを投稿できます
 */
export default function FeedbackPage() {
  const router = useRouter()
  const [type, setType] = useState<'general' | 'bug' | 'feature_request' | 'nps'>('general')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [npsScore, setNpsScore] = useState<number>(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const feedbackTypes = [
    { value: 'general', label: '一般的なフィードバック', icon: MessageSquare, color: 'blue' },
    { value: 'bug', label: 'バグ報告', icon: Bug, color: 'red' },
    { value: 'feature_request', label: '機能リクエスト', icon: Lightbulb, color: 'yellow' },
    { value: 'nps', label: '満足度評価', icon: Star, color: 'purple' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      alert('メッセージを入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title: title.trim() || null,
          message: message.trim(),
          npsScore: type === 'nps' ? npsScore : undefined,
        }),
      })

      if (response.ok) {
        alert('フィードバックを送信しました。ご協力ありがとうございます！')
        setTitle('')
        setMessage('')
        setNpsScore(5)
        router.push('/')
      } else {
        const data = await response.json()
        alert(data.error || 'フィードバックの送信に失敗しました')
      }
    } catch (error) {
      console.error('フィードバック送信エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-lavender/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 hover:bg-spiritual-light/20 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              フィードバック
            </h1>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-gradient-to-br from-spiritual-purple/20 to-spiritual-lavender/20 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
          <p className="text-spiritual-lavender mb-6 text-center">
            あなたのご意見をお聞かせください。よりよいサービスを提供するために役立てます。
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* フィードバックタイプ選択 */}
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                フィードバックの種類 *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {feedbackTypes.map((ft) => {
                  const Icon = ft.icon
                  return (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() => setType(ft.value as any)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        type === ft.value
                          ? 'border-spiritual-gold bg-spiritual-gold/20'
                          : 'border-spiritual-lavender/30 bg-spiritual-dark/30 hover:border-spiritual-lavender/50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        type === ft.value ? 'text-spiritual-gold' : 'text-spiritual-lavender'
                      }`} />
                      <p className={`text-xs md:text-sm font-semibold ${
                        type === ft.value ? 'text-white' : 'text-gray-300'
                      }`}>
                        {ft.label}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* NPS評価スライダー */}
            {type === 'nps' && (
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  友人にこのアプリをお勧めする可能性は？ (0-10)
                </label>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={npsScore}
                    onChange={(e) => setNpsScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-spiritual-lavender/30 rounded-lg appearance-none cursor-pointer accent-spiritual-gold"
                  />
                  <div className="flex items-center justify-between text-xs text-spiritual-lavender">
                    <span>0 (全く勧めない)</span>
                    <span className="text-2xl font-bold text-spiritual-gold">{npsScore}</span>
                    <span>10 (非常に勧める)</span>
                  </div>
                </div>
              </div>
            )}

            {/* タイトル */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                タイトル（任意）
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="簡潔なタイトルを入力"
                maxLength={100}
                className="w-full px-4 py-3 bg-spiritual-dark/50 border-2 border-spiritual-lavender/30 rounded-xl text-white placeholder-spiritual-lavender/60 focus:outline-none focus:border-spiritual-gold transition-colors"
              />
            </div>

            {/* メッセージ */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                詳細 *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? '発生した問題を詳しく教えてください（再現手順、期待される動作など）'
                    : type === 'feature_request'
                    ? '追加してほしい機能を詳しく教えてください'
                    : type === 'nps'
                    ? '評価の理由をお聞かせください'
                    : 'ご意見やご感想をお聞かせください'
                }
                rows={6}
                maxLength={1000}
                className="w-full px-4 py-3 bg-spiritual-dark/50 border-2 border-spiritual-lavender/30 rounded-xl text-white placeholder-spiritual-lavender/60 focus:outline-none focus:border-spiritual-gold transition-colors resize-none"
              />
              <p className="text-xs text-spiritual-lavender/70 mt-1 text-right">
                {message.length} / 1000
              </p>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  送信中...
                </>
              ) : (
                '送信する'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
