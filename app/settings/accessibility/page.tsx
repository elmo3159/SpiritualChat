'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Type, Eye, Palette, Volume2 } from 'lucide-react'

type FontSize = 'small' | 'medium' | 'large' | 'xlarge'
type Contrast = 'normal' | 'high'

/**
 * アクセシビリティ設定ページ
 *
 * フォントサイズ、コントラスト、その他のアクセシビリティ設定を管理します
 */
export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [contrast, setContrast] = useState<Contrast>('normal')
  const [reduceMotion, setReduceMotion] = useState(false)

  // 設定をlocalStorageから読み込み
  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') as FontSize | null
    const savedContrast = localStorage.getItem('contrast') as Contrast | null
    const savedReduceMotion = localStorage.getItem('reduceMotion')

    if (savedFontSize) setFontSize(savedFontSize)
    if (savedContrast) setContrast(savedContrast)
    if (savedReduceMotion) setReduceMotion(savedReduceMotion === 'true')
  }, [])

  // フォントサイズ変更
  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size)
    localStorage.setItem('fontSize', size)

    // ルート要素にクラスを適用
    const root = document.documentElement
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl')

    switch (size) {
      case 'small':
        root.classList.add('text-sm')
        break
      case 'medium':
        root.classList.add('text-base')
        break
      case 'large':
        root.classList.add('text-lg')
        break
      case 'xlarge':
        root.classList.add('text-xl')
        break
    }
  }

  // コントラスト変更
  const handleContrastChange = (contrastMode: Contrast) => {
    setContrast(contrastMode)
    localStorage.setItem('contrast', contrastMode)

    const root = document.documentElement
    if (contrastMode === 'high') {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
  }

  // アニメーション削減
  const handleReduceMotionChange = (enabled: boolean) => {
    setReduceMotion(enabled)
    localStorage.setItem('reduceMotion', enabled.toString())

    const root = document.documentElement
    if (enabled) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }

  const fontSizeOptions = [
    { value: 'small' as FontSize, label: '小', size: '14px' },
    { value: 'medium' as FontSize, label: '標準', size: '16px' },
    { value: 'large' as FontSize, label: '大', size: '18px' },
    { value: 'xlarge' as FontSize, label: '特大', size: '20px' },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-spiritual-dark via-spiritual-darker to-spiritual-purple pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-spiritual-dark/95 backdrop-blur-lg shadow-lg border-b border-spiritual-lavender/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 hover:bg-spiritual-light/20 rounded-full transition-colors"
              aria-label="設定に戻る"
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              アクセシビリティ
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* フォントサイズ設定 */}
        <section
          className="bg-spiritual-darker/50 backdrop-blur-sm rounded-2xl border border-spiritual-lavender/20 overflow-hidden shadow-xl"
          role="region"
          aria-labelledby="font-size-heading"
        >
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2
              id="font-size-heading"
              className="text-lg font-semibold text-spiritual-gold flex items-center gap-2"
            >
              <Type className="w-5 h-5" />
              フォントサイズ
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              画面全体の文字サイズを調整できます
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fontSizeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFontSizeChange(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    fontSize === option.value
                      ? 'bg-spiritual-gold/20 border-spiritual-gold text-spiritual-gold'
                      : 'bg-spiritual-dark/50 border-spiritual-lavender/20 text-gray-300 hover:border-spiritual-lavender/40'
                  }`}
                  aria-pressed={fontSize === option.value}
                  aria-label={`フォントサイズ: ${option.label}`}
                >
                  <div className="text-center">
                    <div
                      className="font-bold mb-1"
                      style={{ fontSize: option.size }}
                    >
                      Aa
                    </div>
                    <div className="text-xs">{option.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* コントラスト設定 */}
        <section
          className="bg-spiritual-darker/50 backdrop-blur-sm rounded-2xl border border-spiritual-lavender/20 overflow-hidden shadow-xl"
          role="region"
          aria-labelledby="contrast-heading"
        >
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2
              id="contrast-heading"
              className="text-lg font-semibold text-spiritual-gold flex items-center gap-2"
            >
              <Palette className="w-5 h-5" />
              コントラスト
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              画面の見やすさを向上させます
            </p>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleContrastChange('normal')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  contrast === 'normal'
                    ? 'bg-spiritual-gold/20 border-spiritual-gold'
                    : 'bg-spiritual-dark/50 border-spiritual-lavender/20 hover:border-spiritual-lavender/40'
                }`}
                aria-pressed={contrast === 'normal'}
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-gray-300" />
                  <div className="text-left">
                    <p className="font-semibold text-white">標準</p>
                    <p className="text-xs text-gray-400">通常の表示</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleContrastChange('high')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  contrast === 'high'
                    ? 'bg-spiritual-gold/20 border-spiritual-gold'
                    : 'bg-spiritual-dark/50 border-spiritual-lavender/20 hover:border-spiritual-lavender/40'
                }`}
                aria-pressed={contrast === 'high'}
              >
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-white" />
                  <div className="text-left">
                    <p className="font-semibold text-white">高コントラスト</p>
                    <p className="text-xs text-gray-400">より見やすく</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* モーション設定 */}
        <section
          className="bg-spiritual-darker/50 backdrop-blur-sm rounded-2xl border border-spiritual-lavender/20 overflow-hidden shadow-xl"
          role="region"
          aria-labelledby="motion-heading"
        >
          <div className="p-5 border-b border-spiritual-lavender/20">
            <h2
              id="motion-heading"
              className="text-lg font-semibold text-spiritual-gold flex items-center gap-2"
            >
              <Volume2 className="w-5 h-5" />
              アニメーション
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              アニメーション効果を抑えます
            </p>
          </div>

          <div className="p-5">
            <button
              onClick={() => handleReduceMotionChange(!reduceMotion)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                reduceMotion
                  ? 'bg-spiritual-gold/20 border-spiritual-gold'
                  : 'bg-spiritual-dark/50 border-spiritual-lavender/20 hover:border-spiritual-lavender/40'
              }`}
              role="switch"
              aria-checked={reduceMotion}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold text-white">
                    アニメーションを削減
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    動きによる不快感を軽減します
                  </p>
                </div>
                <div
                  className={`w-14 h-8 rounded-full transition-colors ${
                    reduceMotion ? 'bg-spiritual-gold' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full m-1 transition-transform ${
                      reduceMotion ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* ヒント */}
        <div className="bg-gradient-to-br from-spiritual-accent/20 to-spiritual-gold/20 backdrop-blur-sm rounded-2xl border border-spiritual-gold/30 p-6">
          <h3 className="text-base font-semibold text-spiritual-gold mb-3">
            スクリーンリーダーをご利用の方へ
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-spiritual-gold mt-1">•</span>
              <span>
                主要な見出しやボタンには、ARIA
                ラベルが設定されています
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-spiritual-gold mt-1">•</span>
              <span>
                フォーカスインジケーターにより、キーボード操作が簡単になります
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-spiritual-gold mt-1">•</span>
              <span>ページ内の主要なセクションにランドマークを設定しています</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
