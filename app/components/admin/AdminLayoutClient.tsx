'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Menu,
  X,
  LogOut,
  Shield,
  ChevronRight,
  Ticket,
  Megaphone,
  Bell,
  Settings,
} from 'lucide-react'
// import { motion, AnimatePresence } from 'framer-motion'
import type { AdminTokenPayload } from '@/lib/auth/admin'

interface Props {
  admin: AdminTokenPayload
  children: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'ダッシュボード',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: '/admin/users',
    label: 'ユーザー管理',
    icon: <Users className="w-5 h-5" />,
  },
  {
    href: '/admin/fortune-tellers',
    label: '占い師管理',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    href: '/admin/coupons',
    label: 'クーポン管理',
    icon: <Ticket className="w-5 h-5" />,
  },
  {
    href: '/admin/campaigns',
    label: 'キャンペーン管理',
    icon: <Megaphone className="w-5 h-5" />,
  },
  {
    href: '/admin/push-notifications',
    label: 'プッシュ通知',
    icon: <Bell className="w-5 h-5" />,
  },
  {
    href: '/admin/settings',
    label: '設定',
    icon: <Settings className="w-5 h-5" />,
  },
]

/**
 * 管理者ダッシュボードレイアウトコンポーネント
 *
 * レスポンシブなサイドバーナビゲーションとヘッダーを提供
 */
export default function AdminLayoutClient({ admin, children }: Props) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      })
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー（モバイル用） */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="メニュー"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">スピチャ管理</h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="ログアウト"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      {/* サイドバー（デスクトップ） */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* ロゴ */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">スピチャ管理</h1>
              <p className="text-xs text-gray-500">管理ダッシュボード</p>
            </div>
          </div>

          {/* ナビゲーション */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* 管理者情報 */}
          <div className="px-4 py-4 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {admin.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {admin.email}
                </p>
                <p className="text-xs text-gray-600">{admin.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </aside>

      {/* モバイルサイドバーオーバーレイ */}
      {isSidebarOpen && (
        <>
          {/* オーバーレイ背景 */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* サイドバー */}
          <aside
            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300"
          >
              {/* ロゴ */}
              <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">スピチャ管理</h1>
                  <p className="text-xs text-gray-500">管理ダッシュボード</p>
                </div>
              </div>

              {/* ナビゲーション */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  )
                })}
              </nav>

              {/* 管理者情報 */}
              <div className="px-4 py-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                    {admin.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {admin.email}
                    </p>
                    <p className="text-xs text-gray-600">{admin.role}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ログアウト</span>
                </button>
              </div>
          </aside>
        </>
      )}

      {/* メインコンテンツ */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
