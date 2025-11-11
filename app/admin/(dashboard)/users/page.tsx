import { Suspense } from 'react'
import { createAdminClient } from '@/lib/supabase/server'
import { Users, Search, Calendar, CreditCard } from 'lucide-react'
import Link from 'next/link'

/**
 * ユーザー一覧ページ
 *
 * 全ユーザーの一覧を表示し、検索・フィルタリング機能を提供
 */

interface User {
  id: string
  email: string
  created_at: string
  nickname: string | null
  birth_date: string | null
  gender: string | null
  points_balance: number | null
}

async function getUsersData(searchQuery?: string): Promise<User[]> {
  const supabase = createAdminClient()

  // auth.usersテーブルから直接取得はできないため、
  // profilesとuser_pointsをJOINしたクエリを使用
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

  if (authError) {
    console.error('Error fetching auth users:', authError)
    return []
  }

  // 各ユーザーのプロフィールとポイントを取得
  const usersWithData = await Promise.all(
    authUsers.users.map(async (authUser) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, birth_date, gender')
        .eq('id', authUser.id)
        .single()

      const { data: points } = await supabase
        .from('user_points')
        .select('points_balance')
        .eq('user_id', authUser.id)
        .single()

      return {
        id: authUser.id,
        email: authUser.email || '',
        created_at: authUser.created_at,
        nickname: profile?.nickname || null,
        birth_date: profile?.birth_date || null,
        gender: profile?.gender || null,
        points_balance: points?.points_balance || 0,
      }
    })
  )

  // 検索フィルタを適用
  let filteredUsers = usersWithData
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredUsers = usersWithData.filter(
      (user) =>
        user.email.toLowerCase().includes(query) ||
        (user.nickname && user.nickname.toLowerCase().includes(query))
    )
  }

  // 作成日時の降順でソート
  return filteredUsers.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

interface PageProps {
  searchParams: { q?: string }
}

// キャッシュを無効化して常に最新のデータを取得
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function UsersPage({ searchParams }: PageProps) {
  const searchQuery = searchParams.q || ''
  const users = await getUsersData(searchQuery)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            ユーザー管理
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            登録ユーザーの一覧と詳細情報
          </p>
        </div>
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
              placeholder="メールアドレスまたは名前で検索..."
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">総ユーザー数</p>
              <p className="text-3xl font-bold mt-1">{users.length}</p>
            </div>
            <Users className="w-12 h-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">総ポイント保有</p>
              <p className="text-3xl font-bold mt-1">
                {users
                  .reduce(
                    (sum, user) =>
                      sum + (user.points_balance || 0),
                    0
                  )
                  .toLocaleString()}
              </p>
            </div>
            <CreditCard className="w-12 h-12 text-indigo-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm font-medium">今月の新規登録</p>
              <p className="text-3xl font-bold mt-1">
                {
                  users.filter((user) => {
                    const userDate = new Date(user.created_at)
                    const now = new Date()
                    return (
                      userDate.getMonth() === now.getMonth() &&
                      userDate.getFullYear() === now.getFullYear()
                    )
                  }).length
                }
              </p>
            </div>
            <Calendar className="w-12 h-12 text-pink-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* ユーザー一覧テーブル */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">
                  性別
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                  生年月日
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  ポイント
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                  登録日
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  アクション
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {searchQuery
                        ? '該当するユーザーが見つかりませんでした'
                        : 'ユーザーがまだ登録されていません'}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {user.nickname?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {user.nickname || '名前未設定'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">
                        {user.gender === 'male'
                          ? '男性'
                          : user.gender === 'female'
                            ? '女性'
                            : user.gender === 'other'
                              ? 'その他'
                              : '未設定'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">
                        {user.birth_date
                          ? new Date(user.birth_date).toLocaleDateString(
                              'ja-JP'
                            )
                          : '未設定'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                          {(user.points_balance || 0).toLocaleString()} pt
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
