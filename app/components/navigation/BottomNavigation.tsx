'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, User, Settings, Coins } from 'lucide-react'

/**
 * モバイル特化ボトムナビゲーション
 *
 * 占いタブ、プロフィールタブ、設定タブを提供
 */
export default function BottomNavigation() {
  const pathname = usePathname()

  // ボトムナビゲーションを非表示にするページ
  const shouldHide =
    pathname === '/' ||
    pathname?.startsWith('/chat/') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname === '/profile/create' ||
    pathname?.startsWith('/terms') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/horoscope')

  // 非表示の場合は何もレンダリングしない
  if (shouldHide) {
    return null
  }

  const isFortuneActive = pathname === '/fortune-tellers'
  const isPointsActive = pathname?.startsWith('/points')
  const isProfileActive = pathname?.startsWith('/profile')
  const isSettingsActive = pathname?.startsWith('/settings')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-spiritual-pink/95 backdrop-blur-lg border-t border-spiritual-pink-dark/30 shadow-2xl">
      <div className="flex items-center justify-around min-h-16 px-4 pb-safe">
        {/* 占いタブ */}
        <Link
          href="/fortune-tellers"
          className={`
            flex flex-col items-center justify-center gap-1 flex-1 h-full
            transition-all duration-300
            ${isFortuneActive ? 'text-white' : 'text-white/60'}
          `}
        >
          <div className={`
            relative p-2 rounded-2xl transition-all duration-300
            ${isFortuneActive
              ? 'bg-white/30 shadow-lg shadow-white/30'
              : 'bg-transparent'
            }
          `}>
            <Sparkles
              className={`
                w-6 h-6 transition-all duration-300
                ${isFortuneActive ? 'scale-110' : 'scale-100'}
              `}
            />
            {isFortuneActive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </div>
          <span className={`
            text-xs font-medium transition-all duration-300
            ${isFortuneActive ? 'font-bold' : 'font-normal'}
          `}>
            占い
          </span>
        </Link>

        {/* ポイントタブ */}
        <Link
          href="/points/purchase"
          className={`
            flex flex-col items-center justify-center gap-1 flex-1 h-full
            transition-all duration-300
            ${isPointsActive ? 'text-white' : 'text-white/60'}
          `}
        >
          <div className={`
            relative p-2 rounded-2xl transition-all duration-300
            ${isPointsActive
              ? 'bg-white/30 shadow-lg shadow-white/30'
              : 'bg-transparent'
            }
          `}>
            <Coins
              className={`
                w-6 h-6 transition-all duration-300
                ${isPointsActive ? 'scale-110' : 'scale-100'}
              `}
            />
            {isPointsActive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </div>
          <span className={`
            text-xs font-medium transition-all duration-300
            ${isPointsActive ? 'font-bold' : 'font-normal'}
          `}>
            ポイント
          </span>
        </Link>

        {/* プロフィールタブ */}
        <Link
          href="/profile/edit"
          className={`
            flex flex-col items-center justify-center gap-1 flex-1 h-full
            transition-all duration-300
            ${isProfileActive ? 'text-white' : 'text-white/60'}
          `}
        >
          <div className={`
            relative p-2 rounded-2xl transition-all duration-300
            ${isProfileActive
              ? 'bg-white/30 shadow-lg shadow-white/30'
              : 'bg-transparent'
            }
          `}>
            <User
              className={`
                w-6 h-6 transition-all duration-300
                ${isProfileActive ? 'scale-110' : 'scale-100'}
              `}
            />
            {isProfileActive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </div>
          <span className={`
            text-xs font-medium transition-all duration-300
            ${isProfileActive ? 'font-bold' : 'font-normal'}
          `}>
            プロフィール
          </span>
        </Link>

        {/* 設定タブ */}
        <Link
          href="/settings"
          className={`
            flex flex-col items-center justify-center gap-1 flex-1 h-full
            transition-all duration-300
            ${isSettingsActive ? 'text-white' : 'text-white/60'}
          `}
        >
          <div className={`
            relative p-2 rounded-2xl transition-all duration-300
            ${isSettingsActive
              ? 'bg-white/30 shadow-lg shadow-white/30'
              : 'bg-transparent'
            }
          `}>
            <Settings
              className={`
                w-6 h-6 transition-all duration-300
                ${isSettingsActive ? 'scale-110' : 'scale-100'}
              `}
            />
            {isSettingsActive && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
            )}
          </div>
          <span className={`
            text-xs font-medium transition-all duration-300
            ${isSettingsActive ? 'font-bold' : 'font-normal'}
          `}>
            設定
          </span>
        </Link>
      </div>
    </nav>
  )
}
