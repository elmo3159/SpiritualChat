'use client'

import { useState, useEffect } from 'react'
import { Star, User } from 'lucide-react'

interface Review {
  id: string
  rating: number
  comment: string
  created_at: string
  profiles: {
    nickname: string
  }
}

interface Props {
  fortuneTellerId: string
}

/**
 * レビュー一覧コンポーネント
 *
 * 占い師へのレビューを一覧表示します
 */
export default function ReviewList({ fortuneTellerId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [averageRating, setAverageRating] = useState(0)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `/api/reviews?fortuneTellerId=${fortuneTellerId}`
        )
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews || [])

          // 平均評価を計算
          if (data.reviews && data.reviews.length > 0) {
            const sum = data.reviews.reduce(
              (acc: number, r: Review) => acc + r.rating,
              0
            )
            setAverageRating(sum / data.reviews.length)
          }
        }
      } catch (error) {
        console.error('レビュー取得エラー:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [fortuneTellerId])

  // 相対時間表示
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return '今日'
    if (diffDays === 1) return '昨日'
    if (diffDays < 7) return `${diffDays}日前`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`
    return `${Math.floor(diffDays / 365)}年前`
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-spiritual-lavender">
        読み込み中...
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star className="w-12 h-12 text-spiritual-lavender/50 mx-auto mb-3" />
        <p className="text-spiritual-lavender">
          まだレビューがありません
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 平均評価 */}
      <div className="bg-gradient-to-br from-spiritual-purple/30 to-spiritual-lavender/30 backdrop-blur-sm rounded-2xl p-6 border border-spiritual-lavender/30">
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2">
            {averageRating.toFixed(1)}
          </p>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(averageRating)
                    ? 'fill-spiritual-gold text-spiritual-gold'
                    : 'text-gray-500'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-spiritual-lavender">
            {reviews.length}件のレビュー
          </p>
        </div>
      </div>

      {/* レビュー一覧 */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-gradient-to-br from-spiritual-purple/20 to-spiritual-lavender/20 backdrop-blur-sm rounded-xl p-4 border border-spiritual-lavender/20"
          >
            {/* ユーザー情報 */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-spiritual-lavender/30 flex items-center justify-center">
                <User className="w-6 h-6 text-spiritual-lavender" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">
                  {review.profiles?.nickname || '匿名ユーザー'}
                </p>
                <p className="text-xs text-spiritual-lavender/70">
                  {getRelativeTime(review.created_at)}
                </p>
              </div>
            </div>

            {/* 評価 */}
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-spiritual-gold text-spiritual-gold'
                      : 'text-gray-500'
                  }`}
                />
              ))}
            </div>

            {/* コメント */}
            {review.comment && (
              <p className="text-sm text-gray-300 leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
