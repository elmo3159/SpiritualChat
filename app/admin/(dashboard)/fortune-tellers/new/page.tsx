import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FortuneTellerForm from '@/app/components/admin/FortuneTellerForm'

/**
 * 占い師新規作成ページ
 *
 * 新しいAI占い師を作成するフォーム
 */
export default function NewFortuneTellerPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/fortune-tellers"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            占い師を新規作成
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            新しいAI占い師を設定します
          </p>
        </div>
      </div>

      {/* フォーム */}
      <FortuneTellerForm mode="create" />
    </div>
  )
}
