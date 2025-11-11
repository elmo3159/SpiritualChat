import { redirect } from 'next/navigation'
import { getCurrentAdmin } from '@/lib/auth/admin'
import AdminLayoutClient from '@/app/components/admin/AdminLayoutClient'

/**
 * 管理者ダッシュボードレイアウト
 *
 * 認証チェックを行い、管理者レイアウトを適用します
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getCurrentAdmin()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <AdminLayoutClient admin={admin}>
      {children}
    </AdminLayoutClient>
  )
}
