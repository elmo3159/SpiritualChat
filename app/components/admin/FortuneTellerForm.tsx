'use client'

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Sparkles, Upload, X, Image as ImageIcon } from 'lucide-react'

interface FortuneTellerFormProps {
  mode: 'create' | 'edit'
  initialData?: {
    id?: string
    name: string
    title: string
    description: string
    specialties: string[]
    system_prompt: string
    suggestion_prompt: string
    re_suggestion_prompt?: string
    divination_prompt: string
    is_active: boolean
    avatar_url?: string | null
  }
}

/**
 * 占い師フォームコンポーネント
 *
 * 占い師の新規作成と編集に使用する共通フォーム
 */
export default function FortuneTellerForm({
  mode,
  initialData,
}: FortuneTellerFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(initialData?.name || '')
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [specialties, setSpecialties] = useState(
    initialData?.specialties?.join('、') || ''
  )
  const [suggestionPrompt, setSuggestionPrompt] = useState(
    initialData?.suggestion_prompt || ''
  )
  const [reSuggestionPrompt, setReSuggestionPrompt] = useState(
    initialData?.re_suggestion_prompt || ''
  )
  const [divinationPrompt, setDivinationPrompt] = useState(
    initialData?.divination_prompt || ''
  )
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true)
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar_url || null
  )
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // アバター画像ファイル選択ハンドラー
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルタイプチェック
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    // ファイルサイズチェック（5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください')
      return
    }

    setAvatarFile(file)

    // プレビュー用のURLを生成
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // アバター画像アップロード処理
  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    setIsUploadingAvatar(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', avatarFile)

      const response = await fetch('/api/admin/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || 'アップロードに失敗しました')
        setIsUploadingAvatar(false)
        return
      }

      // アップロード成功
      setAvatarUrl(result.data.url)
      setAvatarFile(null)
      setIsUploadingAvatar(false)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError('画像のアップロードに失敗しました')
      setIsUploadingAvatar(false)
    }
  }

  // アバター画像削除ハンドラー
  const handleRemoveAvatar = () => {
    setAvatarUrl('')
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // バリデーション
    if (!name || !title || !description || !specialties || !suggestionPrompt || !reSuggestionPrompt || !divinationPrompt) {
      setError('すべての必須項目を入力してください')
      return
    }

    setIsLoading(true)

    try {
      const endpoint =
        mode === 'create'
          ? '/api/admin/fortune-tellers'
          : `/api/admin/fortune-tellers/${initialData?.id}`

      // specialtiesを配列に変換（「、」または「,」で区切る）
      const specialtiesArray = specialties
        .split(/[、,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0)

      const response = await fetch(endpoint, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          title,
          description,
          specialties: specialtiesArray,
          suggestion_prompt: suggestionPrompt,
          re_suggestion_prompt: reSuggestionPrompt,
          divination_prompt: divinationPrompt,
          is_active: isActive,
          avatar_url: avatarUrl || null,
        }),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.message || '保存に失敗しました')
        setIsLoading(false)
        return
      }

      // 成功したら一覧ページに戻る
      router.push('/admin/fortune-tellers')
      router.refresh()
    } catch (err) {
      console.error('Fortune teller form error:', err)
      setError('予期しないエラーが発生しました')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
      {/* エラーメッセージ */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* 基本情報カード */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          基本情報
        </h2>

        <div className="space-y-5">
          {/* アバター画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              アバター画像
            </label>

            <div className="flex items-start gap-4">
              {/* 画像プレビュー */}
              <div className="flex-shrink-0">
                {avatarPreview ? (
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={isLoading || isUploadingAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* アップロードコントロール */}
              <div className="flex-1 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                  disabled={isLoading || isUploadingAvatar}
                  className="hidden"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploadingAvatar}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    ファイルを選択
                  </button>

                  {avatarFile && (
                    <button
                      type="button"
                      onClick={handleAvatarUpload}
                      disabled={isLoading || isUploadingAvatar}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-2"
                    >
                      {isUploadingAvatar ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          アップロード中...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          アップロード
                        </>
                      )}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPEG、PNG、WebP、GIF形式（最大5MB）
                  {avatarFile && (
                    <span className="block mt-1 text-purple-600 dark:text-purple-400">
                      選択中: {avatarFile.name}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 名前 */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isLoading}
              placeholder="例: 月影先生"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {/* キャッチフレーズ */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              キャッチフレーズ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isLoading}
              placeholder="例: 恋愛に特化したタロット占い師"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              占い師一覧ページで名前の下に表示されます
            </p>
          </div>

          {/* 特技/専門分野 */}
          <div>
            <label
              htmlFor="specialties"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              特技/専門分野 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="specialties"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              required
              disabled={isLoading}
              placeholder="例: 恋愛運、タロット、人間関係（「、」で区切って入力）"
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              複数の特技を「、」または「,」で区切って入力してください
            </p>
          </div>

          {/* 説明（管理者用メモ） */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              説明（管理者用メモ） <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              disabled={isLoading}
              rows={4}
              placeholder="管理画面でのみ表示される占い師の詳細情報やメモを入力してください..."
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {description.length}/500文字 ・ ユーザーには表示されません
            </p>
          </div>

          {/* アクティブ状態 */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={isLoading}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              この占い師をアクティブにする（ユーザーに表示）
            </label>
          </div>
        </div>
      </div>

      {/* 初回提案プロンプトカード */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          初回提案プロンプト <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          初回ログイン時の提案生成に使用されるプロンプトです。ユーザーには表示されません。
          <br />
          ユーザー情報、お悩みの内容などが自動的に含まれます。
        </p>

        <textarea
          value={suggestionPrompt}
          onChange={(e) => setSuggestionPrompt(e.target.value)}
          required
          disabled={isLoading}
          rows={12}
          placeholder={`例:
あなたは経験豊富なタロット占い師です。
ユーザーの情報と悩みを分析し、1つの具体的な占い提案を行ってください。

提案内容には以下を含めてください：
- 温かい挨拶
- ユーザーの悩みへの共感
- どのような占いができるか具体的な提案
- 前向きで希望が持てる言葉

形式は自由ですが、自然な会話調で書いてください。`}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 resize-none"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {suggestionPrompt.length}文字
        </p>
      </div>

      {/* 再提案プロンプトカード */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          再提案プロンプト <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          お客様がメッセージを送信した後の提案再生成に使用されるプロンプトです。ユーザーには表示されません。
          <br />
          ユーザー情報、お悩みの内容、チャット履歴、お客様から送信された最新メッセージなどが自動的に含まれます。
        </p>

        <textarea
          value={reSuggestionPrompt}
          onChange={(e) => setReSuggestionPrompt(e.target.value)}
          required
          disabled={isLoading}
          rows={12}
          placeholder={`例:
あなたは経験豊富なタロット占い師です。
ユーザーから新しいメッセージを受け取りました。これまでの会話とユーザーの情報を踏まえて、1つの具体的な占い提案を行ってください。

提案内容には以下を含めてください：
- ユーザーの追加情報や質問への応答
- 更新された悩みへの共感
- より具体的な占いの提案
- 前向きで希望が持てる言葉

形式は自由ですが、自然な会話調で書いてください。`}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 resize-none"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {reSuggestionPrompt.length}文字
        </p>
      </div>

      {/* 鑑定実行プロンプトカード */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          鑑定実行プロンプト <span className="text-red-500">*</span>
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          実際の鑑定を行う際に使用されるプロンプトです。ユーザーには表示されません。
          <br />
          ユーザー情報、お悩みの内容、チャット履歴、鑑定結果などが自動的に含まれます。
        </p>

        <textarea
          value={divinationPrompt}
          onChange={(e) => setDivinationPrompt(e.target.value)}
          required
          disabled={isLoading}
          rows={12}
          placeholder={`例:
あなたは経験豊富なタロット占い師です。
ユーザーの悩みに対して、深い洞察と具体的なアドバイスを提供してください。

鑑定結果には以下を含めてください：
- あなたの占術の具体的な結果
- 現状分析と未来予測
- 実践的なアドバイス
- 前向きで希望が持てる内容

鑑定結果は400文字程度で、温かく丁寧な言葉で書いてください。`}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 resize-none"
        />
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {divinationPrompt.length}文字
        </p>
      </div>

      {/* 送信ボタン */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>保存中...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>{mode === 'create' ? '作成する' : '更新する'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={isLoading}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}
