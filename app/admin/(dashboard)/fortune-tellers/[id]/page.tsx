import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { ArrowLeft, Edit, Trash2, Sparkles, Calendar, Eye } from 'lucide-react'
import Link from 'next/link'

/**
 * 占い師詳細ページ
 */

interface FortuneTeller {
  id: string
  name: string
  description: string
  specialties: string[]
  suggestion_prompt: string
  divination_prompt: string
  is_active: boolean
  created_at: string
  updated_at: string
  divination_results: { id: string }[]
}

async function getFortuneTeller(id: string): Promise<FortuneTeller | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('fortune_tellers')
    .select(
      `
      id,
      name,
      description,
      specialties,
      suggestion_prompt,
      divination_prompt,
      is_active,
      created_at,
      updated_at,
      divination_results (
        id
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching fortune teller:', error)
    return null
  }

  return data as FortuneTeller
}

interface PageProps {
  params: { id: string }
}

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FortuneTellerDetailPage({ params }: PageProps) {
  const fortuneTeller = await getFortuneTeller(params.id)

  if (!fortuneTeller) {
    notFound()
  }

  const divinationCount = fortuneTeller.divination_results?.length || 0

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/fortune-tellers"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
              占い師詳細
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {fortuneTeller.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/fortune-tellers/${fortuneTeller.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-sm"
          >
            <Edit className="w-5 h-5" />
            <span>編集</span>
          </Link>
        </div>
      </div>

      {/* 基本情報カード */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {fortuneTeller.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {fortuneTeller.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {fortuneTeller.specialties.join('、')}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              fortuneTeller.is_active
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {fortuneTeller.is_active ? 'アクティブ' : '非アクティブ'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              説明
            </h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {fortuneTeller.description}
            </p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">総鑑定回数</p>
              <p className="text-3xl font-bold mt-1">
                {divinationCount.toLocaleString()}
              </p>
            </div>
            <Sparkles className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">作成日</p>
              <p className="text-lg font-bold mt-1">
                {new Date(fortuneTeller.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-indigo-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">最終更新</p>
              <p className="text-lg font-bold mt-1">
                {new Date(fortuneTeller.updated_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
            <Eye className="w-12 h-12 text-pink-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* 鑑定提案プロンプト */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          鑑定提案プロンプト
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          占いの提案を生成する際に使用されるプロンプト
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
            {fortuneTeller.suggestion_prompt}
          </pre>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {fortuneTeller.suggestion_prompt.length}文字
        </p>
      </div>

      {/* 鑑定実行プロンプト */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          鑑定実行プロンプト
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          実際の鑑定を行う際に使用されるプロンプト
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap font-mono">
            {fortuneTeller.divination_prompt}
          </pre>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {fortuneTeller.divination_prompt.length}文字
        </p>
      </div>
    </div>
  )
}
