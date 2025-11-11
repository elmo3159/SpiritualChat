import { createAdminClient } from '@/lib/supabase/server'
import { Sparkles, Plus, Search, Eye, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import FortuneTellerOrderControls from './FortuneTellerOrderControls'

/**
 * 占い師一覧ページ
 *
 * 全占い師の一覧を表示し、作成・編集機能を提供
 */

interface FortuneTeller {
  id: string
  name: string
  description: string
  specialties: string[]
  system_prompt: string
  is_active: boolean
  created_at: string
  display_order: number
  divination_results: { id: string }[]
}

async function getFortuneTellers(
  searchQuery?: string
): Promise<FortuneTeller[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('fortune_tellers')
    .select(
      `
      id,
      name,
      description,
      specialties,
      system_prompt,
      is_active,
      created_at,
      display_order,
      divination_results (
        id
      )
    `
    )
    .order('display_order', { ascending: true })

  // 検索クエリがある場合
  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
    )
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching fortune tellers:', error)
    return []
  }

  return (data as FortuneTeller[]) || []
}

interface PageProps {
  searchParams: { q?: string }
}

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FortuneTellersPage({ searchParams }: PageProps) {
  const searchQuery = searchParams.q || ''
  const fortuneTellers = await getFortuneTellers(searchQuery)

  // アクティブな占い師数
  const activeCount = fortuneTellers.filter((ft) => ft.is_active).length

  // 総鑑定回数
  const totalDivinations = fortuneTellers.reduce(
    (sum, ft) => sum + (ft.divination_results?.length || 0),
    0
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            占い師管理
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            AI占い師の作成と管理
          </p>
        </div>

        <Link
          href="/admin/fortune-tellers/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-sm"
        >
          <Plus className="w-5 h-5" />
          <span>新規作成</span>
        </Link>
      </div>

      {/* 検索フォーム */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <form method="GET" className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="名前、説明、特技で検索..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-sm"
          >
            検索
          </button>
        </form>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">総占い師数</p>
              <p className="text-3xl font-bold mt-1">{fortuneTellers.length}</p>
            </div>
            <Sparkles className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">
                アクティブ占い師
              </p>
              <p className="text-3xl font-bold mt-1">{activeCount}</p>
            </div>
            <Eye className="w-12 h-12 text-indigo-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">総鑑定回数</p>
              <p className="text-3xl font-bold mt-1">
                {totalDivinations.toLocaleString()}
              </p>
            </div>
            <Sparkles className="w-12 h-12 text-pink-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* 占い師一覧グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fortuneTellers.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Sparkles className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery
                  ? '該当する占い師が見つかりませんでした'
                  : '占い師がまだ作成されていません'}
              </p>
              <Link
                href="/admin/fortune-tellers/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>最初の占い師を作成</span>
              </Link>
            </div>
          </div>
        ) : (
          fortuneTellers.map((fortuneTeller, index) => (
            <div
              key={fortuneTeller.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* カードヘッダー */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {fortuneTeller.name[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                        {fortuneTeller.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fortuneTeller.specialties.join('、')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <FortuneTellerOrderControls
                      fortuneTellerId={fortuneTeller.id}
                      currentOrder={fortuneTeller.display_order}
                      isFirst={index === 0}
                      isLast={index === fortuneTellers.length - 1}
                    />
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        fortuneTeller.is_active
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {fortuneTeller.is_active ? 'アクティブ' : '非アクティブ'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                  {fortuneTeller.description}
                </p>

                {/* 統計 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {fortuneTeller.divination_results?.length || 0}回鑑定
                    </span>
                  </div>
                  <div className="text-xs">
                    {new Date(fortuneTeller.created_at).toLocaleDateString(
                      'ja-JP'
                    )}
                    作成
                  </div>
                </div>

                {/* アクションボタン */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/admin/fortune-tellers/${fortuneTeller.id}`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>詳細</span>
                  </Link>

                  <Link
                    href={`/admin/fortune-tellers/${fortuneTeller.id}/edit`}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>編集</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
