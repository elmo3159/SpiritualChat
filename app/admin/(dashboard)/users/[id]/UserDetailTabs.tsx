'use client'

import { useState } from 'react'
import { User, History, MessageSquare, Calendar } from 'lucide-react'
import ChatHistorySection from './ChatHistorySection'
import DailyFortuneSection from './DailyFortuneSection'

interface UserDetail {
  id: string
  email: string
  created_at: string
  nickname: string | null
  birth_date: string | null
  gender: string | null
  concern_category: string | null
  concern_description: string | null
  partner_name: string | null
  partner_gender: string | null
  partner_birth_date: string | null
  points_balance: number
}

interface DivinationHistory {
  id: string
  created_at: string
  result_encrypted: string
  points_consumed: number | null
  fortune_teller: {
    name: string
  } | null
}

interface ChatHistoryByFortuneTeller {
  fortuneTellerId: string
  fortuneTellerName: string
  messages: any[]
}

interface Props {
  user: UserDetail
  divinationHistory: DivinationHistory[]
  chatHistory: ChatHistoryByFortuneTeller[]
}

type TabType = 'profile' | 'divination' | 'chat' | 'daily-fortune'

export default function UserDetailTabs({
  user,
  divinationHistory,
  chatHistory,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // 性別の表示用変換
  const getGenderLabel = (gender: string | null) => {
    switch (gender) {
      case 'male':
        return '男性'
      case 'female':
        return '女性'
      case 'other':
        return 'その他'
      default:
        return '未設定'
    }
  }

  // お悩みカテゴリの表示用変換
  const getConcernCategoryLabel = (category: string | null) => {
    const categories: { [key: string]: string } = {
      love: '恋愛',
      unrequited_love: '片思い',
      reconciliation: '復縁',
      affair: '不倫/浮気',
      marriage: '結婚',
      work: '仕事',
      family: '家庭問題',
      fortune: '金運',
    }
    return category ? categories[category] || category : '未設定'
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'プロフィール', icon: User },
    { id: 'divination' as TabType, label: '鑑定履歴', icon: History },
    { id: 'chat' as TabType, label: 'チャット履歴', icon: MessageSquare },
    { id: 'daily-fortune' as TabType, label: '今日の運勢', icon: Calendar },
  ]

  return (
    <div className="space-y-6">
      {/* タブナビゲーション */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="p-6">
          {/* プロフィールタブ */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  基本情報
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      メールアドレス
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white break-all">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">名前</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.nickname || '未設定'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      生年月日
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.birth_date
                        ? new Date(user.birth_date).toLocaleDateString('ja-JP')
                        : '未設定'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">性別</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {getGenderLabel(user.gender)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      登録日
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              </div>

              {/* お悩み情報 */}
              {user.concern_category && (
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    お悩み情報
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        カテゴリ
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {getConcernCategoryLabel(user.concern_category)}
                      </p>
                    </div>

                    {user.concern_description && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          お悩み内容
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1 whitespace-pre-wrap">
                          {user.concern_description}
                        </p>
                      </div>
                    )}

                    {user.partner_name && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            お相手の名前
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white mt-1">
                            {user.partner_name}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            お相手の性別
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white mt-1">
                            {getGenderLabel(user.partner_gender)}
                          </p>
                        </div>

                        {user.partner_birth_date && (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              お相手の生年月日
                            </p>
                            <p className="font-medium text-gray-900 dark:text-white mt-1">
                              {new Date(
                                user.partner_birth_date
                              ).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 鑑定履歴タブ */}
          {activeTab === 'divination' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                鑑定履歴
              </h3>
              {divinationHistory.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    まだ鑑定履歴がありません
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {divinationHistory.map((history) => (
                    <div
                      key={history.id}
                      className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {history.fortune_teller?.name || '不明'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(history.created_at).toLocaleString('ja-JP')}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                          -{history.points_consumed || 0} pt
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {history.result_encrypted.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* チャット履歴タブ */}
          {activeTab === 'chat' && (
            <ChatHistorySection
              initialChatHistory={chatHistory}
              userId={user.id}
            />
          )}

          {/* 今日の運勢タブ */}
          {activeTab === 'daily-fortune' && <DailyFortuneSection userId={user.id} />}
        </div>
      </div>
    </div>
  )
}
