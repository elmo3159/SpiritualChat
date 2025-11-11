'use client'

import { useState } from 'react'
import { X, Star, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  fortuneTellerId: string
  fortuneTellerName: string
  onReviewSubmitted?: () => void
}

/**
 * レビュー投稿モーダル
 *
 * 占い師への評価とコメントを投稿できます
 */
export default function ReviewModal({
  isOpen,
  onClose,
  fortuneTellerId,
  fortuneTellerName,
  onReviewSubmitted,
}: Props) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('評価を選択してください')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fortuneTellerId,
          rating,
          comment: comment.trim(),
        }),
      })

      if (response.ok) {
        alert('レビューを投稿しました')
        setRating(0)
        setComment('')
        onReviewSubmitted?.()
        onClose()
      } else {
        const data = await response.json()
        alert(data.error || 'レビューの投稿に失敗しました')
      }
    } catch (error) {
      console.error('レビュー投稿エラー:', error)
      alert('エラーが発生しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="relative w-full max-w-md bg-gradient-to-br from-spiritual-dark via-spiritual-purple to-spiritual-dark border-2 border-spiritual-gold/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 装飾 */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-spiritual-gold/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-spiritual-accent/20 rounded-full blur-3xl" />

        {/* ヘッダー */}
        <div className="relative p-6 border-b border-spiritual-lavender/30">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-xl font-bold text-white">
            レビューを投稿
          </h2>
          <p className="text-sm text-spiritual-lavender mt-1">
            {fortuneTellerName}
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="relative p-6 space-y-6">
          {/* 評価 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              評価 *
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <Star
                    className={`w-10 h-10 md:w-12 md:h-12 ${
                      star <= (hoverRating || rating)
                        ? 'fill-spiritual-gold text-spiritual-gold'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-spiritual-lavender/70 mt-2">
              {rating === 0
                ? '星をタップして評価してください'
                : rating === 1
                ? '残念でした'
                : rating === 2
                ? 'もう少しでした'
                : rating === 3
                ? '普通でした'
                : rating === 4
                ? '良かったです'
                : '最高でした！'}
            </p>
          </div>

          {/* コメント */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              コメント（任意）
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="占いの感想をお聞かせください"
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-spiritual-dark/50 border-2 border-spiritual-lavender/30 rounded-xl text-white placeholder-spiritual-lavender/60 focus:outline-none focus:border-spiritual-gold transition-colors resize-none"
            />
            <p className="text-xs text-spiritual-lavender/70 mt-1 text-right">
              {comment.length} / 500
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full px-6 py-3 bg-gradient-to-r from-spiritual-accent to-spiritual-gold text-spiritual-dark rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                投稿中...
              </>
            ) : (
              '投稿する'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
