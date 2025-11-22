'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Coins,
  Lock,
  Mail,
  LogOut,
  ChevronRight,
  AlertTriangle,
  Receipt,
  BarChart3,
  User,
  MessageSquare,
  Smartphone,
} from 'lucide-react'
import ChangePasswordModal from './ChangePasswordModal'
import DeleteAccountModal from './DeleteAccountModal'
import ContactForm from '@/app/components/contact/ContactForm'
import PWAGuideSection from '@/app/components/settings/PWAGuideSection'
import Image from 'next/image'

interface Transaction {
  id: string
  amount: number
  created_at: string
  description?: string
}

interface Props {
  userEmail: string
  pointsBalance: number
  recentTransactions: Transaction[]
}

/**
 * 設定ページのメインコンテンツ（クライアントコンポーネント）
 */
export default function SettingsContent({
  userEmail,
  pointsBalance,
  recentTransactions,
}: Props) {
  const router = useRouter()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false)
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigate = (path: string) => {
    setIsNavigating(true)
    router.push(path)
  }

  const handleLogout = async () => {
    if (!confirm('ログアウトしてもよろしいですか？')) return

    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/login')
      } else {
        throw new Error('ログアウトに失敗しました')
      }
    } catch (error) {
      console.error('ログアウトエラー:', error)
      alert('ログアウトに失敗しました')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-pink-lighter/30 via-white to-spiritual-pink-lighter/20 pb-20 relative">
      {/* ローディングオーバーレイ */}
      {isNavigating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-spiritual-darker/90 rounded-2xl p-6 flex flex-col items-center gap-3 border border-spiritual-gold/30">
            <div className="w-12 h-12 border-4 border-spiritual-gold/30 border-t-spiritual-gold rounded-full animate-spin"></div>
            <p className="text-spiritual-gold font-medium">読み込み中...</p>
          </div>
        </div>
      )}

      {/* ヘッダー */}
      <div className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg border-b border-spiritual-lavender/30">
        <div className="max-w-2xl mx-auto px-4 py-4 pt-safe-top flex items-center justify-between">
          <Image
            src="/images/logo.png?v=2"
            alt="スピチャ"
            width={160}
            height={56}
            className="w-auto h-9"
            priority
          />
          <span className="text-lg font-semibold text-spiritual-gold">設定</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* ポイント管理セクション */}
        <section className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 overflow-hidden">
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2 className="text-lg font-semibold text-spiritual-gold flex items-center gap-2">
              <Coins className="w-5 h-5" />
              ポイント管理
            </h2>
          </div>
          <div className="p-5 space-y-4">
            {/* 現在のポイント残高 */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-br from-spiritual-accent/10 to-spiritual-gold/10 rounded-lg border border-spiritual-gold/30">
              <div>
                <p className="text-sm text-gray-400">現在の残高</p>
                <p className="text-3xl font-bold text-spiritual-gold mt-1">
                  {pointsBalance.toLocaleString()}
                  <span className="text-lg ml-1">pt</span>
                </p>
              </div>
              <Coins className="w-12 h-12 text-spiritual-gold/50" />
            </div>

            {/* ポイント追加ボタン */}
            <button
              onClick={() => handleNavigate('/points/purchase')}
              disabled={isNavigating}
              className="w-full px-6 py-4 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 text-spiritual-dark rounded-xl font-bold shadow-lg shadow-spiritual-gold/30 hover:shadow-xl hover:shadow-spiritual-gold/50 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coins className="w-5 h-5" />
              ポイントを追加
            </button>

            {/* 購入履歴 */}
            {recentTransactions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">最近の購入履歴</p>
                  <button
                    onClick={() => handleNavigate('/points/history')}
                    disabled={isNavigating}
                    className="text-xs text-spiritual-gold hover:text-spiritual-accent transition-colors flex items-center gap-1 disabled:opacity-50"
                  >
                    すべて見る
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {recentTransactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 bg-spiritual-dark/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {transaction.description || 'ポイント購入'}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-spiritual-gold">
                        +{transaction.amount.toLocaleString()}pt
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* プロフィール・統計セクション */}
        <section className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 overflow-hidden">
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2 className="text-lg font-semibold text-spiritual-gold flex items-center gap-2">
              <User className="w-5 h-5" />
              プロフィール・統計
            </h2>
          </div>
          <div className="divide-y divide-spiritual-lavender/10">
            {/* プロフィール編集 */}
            <button
              onClick={() => handleNavigate('/profile/edit')}
              disabled={isNavigating}
              className="w-full px-5 py-4 hover:bg-spiritual-light/10 transition-colors flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-spiritual-lavender" />
                <div className="text-left">
                  <p className="text-base text-gray-100 font-medium">
                    プロフィール編集
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    名前や悩みカテゴリを変更
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-spiritual-gold transition-colors" />
            </button>

            {/* 統計を見る */}
            <button
              onClick={() => handleNavigate('/profile/stats')}
              disabled={isNavigating}
              className="w-full px-5 py-4 hover:bg-spiritual-light/10 transition-colors flex items-center justify-between group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-spiritual-lavender" />
                <div className="text-left">
                  <p className="text-base text-gray-100 font-medium">
                    あなたの統計
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    鑑定回数やバッジを確認
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-spiritual-gold transition-colors" />
            </button>
          </div>
        </section>

        {/* アプリ化（PWA）セクション */}
        <section className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 overflow-hidden">
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2 className="text-lg font-semibold text-spiritual-gold flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              アプリとして使う
            </h2>
          </div>
          <div className="p-5">
            <PWAGuideSection />
          </div>
        </section>

        {/* アカウント設定セクション */}
        <section className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 overflow-hidden">
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2 className="text-lg font-semibold text-spiritual-gold">
              アカウント設定
            </h2>
          </div>
          <div className="divide-y divide-spiritual-lavender/10">
            {/* メールアドレス */}
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">メールアドレス</p>
                  <p className="text-white mt-1">{userEmail}</p>
                </div>
              </div>
            </div>

            {/* パスワード変更 */}
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-400" />
                <span className="text-white">パスワード変更</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* ログアウト */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-400" />
                <span className="text-white">
                  {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

        {/* サポートセクション */}
        <section className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-spiritual-lavender/20 overflow-hidden">
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2 className="text-lg font-semibold text-spiritual-gold">
              サポート
            </h2>
          </div>
          <div className="divide-y divide-spiritual-lavender/10">
            {/* アクセシビリティ設定 */}
            <button
              onClick={() => handleNavigate('/settings/accessibility')}
              disabled={isNavigating}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <div className="text-left">
                  <span className="text-white">アクセシビリティ</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    フォントサイズやコントラストの調整
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* お問い合わせ */}
            <button
              onClick={() => setIsContactFormOpen(true)}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <span className="text-white">お問い合わせ</span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    バグ報告や機能要望を送信
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* 利用規約 */}
            <button
              onClick={() => handleNavigate('/terms')}
              disabled={isNavigating}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
            >
              <span className="text-white">利用規約</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* プライバシーポリシー */}
            <button
              onClick={() => handleNavigate('/privacy')}
              disabled={isNavigating}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
            >
              <span className="text-white">プライバシーポリシー</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            {/* 特定商取引法に基づく表記 */}
            <button
              onClick={() => handleNavigate('/legal/tokusho')}
              disabled={isNavigating}
              className="w-full p-5 flex items-center justify-between hover:bg-spiritual-dark/50 transition-colors disabled:opacity-50"
            >
              <span className="text-white">特定商取引法に基づく表記</span>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

        {/* 危険な操作セクション */}
        <section className="bg-spiritual-darker/50 backdrop-blur-sm rounded-xl border border-red-500/20 overflow-hidden">
          <div className="p-5 border-b border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              危険な操作
            </h2>
          </div>
          <div>
            <button
              onClick={() => setIsDeleteAccountModalOpen(true)}
              className="w-full p-5 flex items-center justify-between hover:bg-red-900/20 transition-colors"
            >
              <span className="text-red-400">アカウントを削除</span>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </section>

        {/* バージョン情報 */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">スピチャ v1.0.0</p>
        </div>
      </div>

      {/* モーダル */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
      {isContactFormOpen && (
        <ContactForm onClose={() => setIsContactFormOpen(false)} />
      )}
    </div>
  )
}
