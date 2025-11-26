'use client'

import { useState, useEffect } from 'react'
import { X, Send, Upload, Loader2, CheckCircle2 } from 'lucide-react'
import { trackMetaContact } from '@/lib/analytics/meta-pixel'

interface ContactFormProps {
  onClose: () => void
}

const CATEGORIES = [
  { value: 'bug', label: 'バグ報告' },
  { value: 'feature', label: '機能要望' },
  { value: 'other', label: 'その他の問い合わせ' },
]

/**
 * 問い合わせフォームコンポーネント
 */
export default function ContactForm({ onClose }: ContactFormProps) {
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 画像URLのクリーンアップ
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [imageUrls])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files)
      // 最大3枚まで
      if (images.length + newImages.length > 3) {
        setError('画像は最大3枚までアップロードできます')
        return
      }
      // 各ファイルが5MB以下か確認
      const oversizedFiles = newImages.filter(file => file.size > 5 * 1024 * 1024)
      if (oversizedFiles.length > 0) {
        setError('各画像は5MB以下にしてください')
        return
      }

      // 画像とプレビューURLを追加
      const newUrls = newImages.map(file => URL.createObjectURL(file))
      setImages([...images, ...newImages])
      setImageUrls([...imageUrls, ...newUrls])
      setError(null)
    }
  }

  const removeImage = (index: number) => {
    // 古いURLを解放
    URL.revokeObjectURL(imageUrls[index])

    setImages(images.filter((_, i) => i !== index))
    setImageUrls(imageUrls.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category) {
      setError('カテゴリを選択してください')
      return
    }

    if (!message.trim()) {
      setError('お問い合わせ内容を入力してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // FormDataを作成
      const formData = new FormData()
      formData.append('category', category)
      formData.append('message', message)

      // 画像を追加
      images.forEach((image) => {
        formData.append('images', image)
      })

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMsg = result.details
          ? `${result.error}: ${result.details}`
          : result.error || 'お問い合わせの送信に失敗しました'
        throw new Error(errorMsg)
      }

      setIsSuccess(true)

      // Meta Pixel: Contact イベント
      trackMetaContact()

      // 2秒後に閉じる
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err) {
      console.error('お問い合わせ送信エラー:', err)
      setError(err instanceof Error ? err.message : 'お問い合わせの送信に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-br from-spiritual-dark via-spiritual-purple to-spiritual-dark border-2 border-spiritual-gold/50 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* 装飾的な背景 */}
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
          <h2 className="text-2xl font-bold text-white">お問い合わせ</h2>
          <p className="text-sm text-spiritual-lavender mt-1">
            バグ報告や機能要望、その他のお問い合わせはこちらから
          </p>
        </div>

        {/* フォーム */}
        <div className="relative p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-xl font-semibold text-white mb-2">送信完了</p>
              <p className="text-sm text-gray-400">
                お問い合わせありがとうございました
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* エラーメッセージ */}
              {error && (
                <div className="p-4 bg-red-900/50 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {error}
                </div>
              )}

              {/* カテゴリ選択 */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  カテゴリ <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        category === cat.value
                          ? 'border-spiritual-gold bg-spiritual-gold/20 text-white'
                          : 'border-spiritual-lavender/30 bg-spiritual-darker/50 text-gray-300 hover:border-spiritual-gold/50'
                      }`}
                    >
                      <p className="text-sm font-semibold">{cat.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* メッセージ入力 */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  お問い合わせ内容 <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 bg-spiritual-darker/80 border-2 border-spiritual-lavender/30 rounded-xl text-white placeholder-gray-500 focus:border-spiritual-gold focus:outline-none resize-none"
                  placeholder="詳しい内容をご記入ください..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length} / 2000文字
                </p>
              </div>

              {/* 画像アップロード */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  画像添付（任意、最大3枚、各5MB以下）
                </label>

                {/* アップロードボタン */}
                {images.length < 3 && (
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-spiritual-accent/20 hover:bg-spiritual-accent/30 border-2 border-spiritual-accent/50 rounded-xl text-spiritual-accent font-semibold cursor-pointer transition-all">
                    <Upload className="w-4 h-4" />
                    <span>画像を選択</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}

                {/* プレビュー */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrls[index]}
                          alt={`プレビュー ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-spiritual-lavender/30"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                        <p className="text-xs text-gray-400 mt-1 truncate">
                          {image.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 送信ボタン */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-spiritual-gold to-spiritual-accent hover:opacity-90 text-white rounded-xl font-semibold transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      送信する
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
