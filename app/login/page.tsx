'use client'

import { useState, Suspense, useEffect } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('ログインに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)

    try {
      const { error } = await signInWithGoogle()

      if (error) {
        setError(error.message)
        setLoading(false)
      }
      // Google OAuth will redirect, so we don't set loading to false here
    } catch (err) {
      setError('Googleログインに失敗しました')
      setLoading(false)
    }
  }

  // Check for auth error from URL
  const authError = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gradient-to-b from-spiritual-dark via-spiritual-darker to-spiritual-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background stars decoration */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-spiritual-gold rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card with spiritual design */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-spiritual-pink/30 p-8">
          {/* Logo/Title with mascot */}
          <div className="text-center mb-8">
            <div className="mb-3 flex justify-center items-center gap-2">
              <Image
                src="/images/logo.png?v=2"
                alt="スピチャ"
                width={280}
                height={100}
                className="w-auto h-20"
                priority
              />
              <Image
                src="/images/mascot2.png"
                alt=""
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
          </div>

          {/* Error message */}
          {(error || authError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error || '認証に失敗しました。もう一度お試しください。'}
            </div>
          )}

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mb-6 py-3 px-4 bg-white border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Googleでログイン・登録
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-spiritual-pink focus:border-transparent transition-all text-gray-900"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-spiritual-pink focus:border-transparent transition-all text-gray-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-spiritual-pink via-spiritual-pink-dark to-spiritual-pink text-white rounded-xl font-medium hover:scale-105 transition-all duration-200 shadow-lg shadow-spiritual-pink/50 hover:shadow-xl hover:shadow-spiritual-pink/60 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          {/* Security Message */}
          <div className="mt-6 p-4 bg-spiritual-pink-lighter/30 border border-spiritual-pink/30 rounded-xl">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-spiritual-pink-dark flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-semibold">安心してご登録いただけます</span><br />
                  お客様の個人情報やお支払い情報は、SSL暗号化通信により厳重に保護されています。悪用や漏洩の心配はございません。
                </p>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            ログイン・登録することで、
            <Link
              href="/terms"
              className="text-spiritual-pink-dark hover:text-spiritual-pink-deep underline transition-colors"
            >
              利用規約
            </Link>
            、
            <Link
              href="/privacy"
              className="text-spiritual-pink-dark hover:text-spiritual-pink-deep underline transition-colors"
            >
              プライバシーポリシー
            </Link>
            、
            <Link
              href="/legal/tokusho"
              className="text-spiritual-pink-dark hover:text-spiritual-pink-deep underline transition-colors"
            >
              特定商取引法に基づく表記
            </Link>
            に同意したものとみなされます
          </p>

          {/* Sign up link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            アカウントをお持ちでないですか？{' '}
            <Link
              href="/signup"
              className="text-spiritual-pink-dark hover:text-spiritual-pink-deep font-medium transition-colors"
            >
              新規登録
            </Link>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <Link
              href="/terms"
              className="hover:text-spiritual-pink-dark transition-colors underline"
            >
              利用規約
            </Link>
            <span className="mx-2">•</span>
            <Link
              href="/privacy"
              className="hover:text-spiritual-pink-dark transition-colors underline"
            >
              プライバシーポリシー
            </Link>
            <span className="mx-2">•</span>
            <Link
              href="/legal/tokusho"
              className="hover:text-spiritual-pink-dark transition-colors underline"
            >
              特定商取引法に基づく表記
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-white/70">
          © 2025 スピチャ. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-spiritual-dark via-spiritual-darker to-spiritual-navy flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-spiritual-pink"></div>
          <p className="mt-4 text-spiritual-pink">読み込み中...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
