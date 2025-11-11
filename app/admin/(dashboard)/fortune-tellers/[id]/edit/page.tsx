import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FortuneTellerForm from '@/app/components/admin/FortuneTellerForm'

/**
 * 占い師編集ページ
 */

interface FortuneTeller {
  id: string
  name: string
  title: string
  description: string
  specialties: string[]
  system_prompt: string
  suggestion_prompt: string
  re_suggestion_prompt: string
  divination_prompt: string
  is_active: boolean
  avatar_url?: string | null
}

async function getFortuneTeller(id: string): Promise<FortuneTeller | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('fortune_tellers')
    .select('id, name, title, description, specialties, system_prompt, suggestion_prompt, re_suggestion_prompt, divination_prompt, is_active, avatar_url')
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

export default async function EditFortuneTellerPage({ params }: PageProps) {
  const fortuneTeller = await getFortuneTeller(params.id)

  if (!fortuneTeller) {
    notFound()
  }

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
            占い師を編集
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {fortuneTeller.name}
          </p>
        </div>
      </div>

      {/* フォーム */}
      <FortuneTellerForm mode="edit" initialData={fortuneTeller} />
    </div>
  )
}
