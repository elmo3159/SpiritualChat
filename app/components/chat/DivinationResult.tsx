'use client'

import { Lock, Sparkles, Loader2, Coins } from 'lucide-react'
import type { DivinationResultDisplay } from '@/lib/types/divination'
import Link from 'next/link'

interface Props {
  /**
   * 鑑定結果データ
   */
  divination: DivinationResultDisplay

  /**
   * 開封ボタンクリック時のコールバック
   */
  onUnlock?: (divinationId: string) => Promise<void>

  /**
   * 開封処理中のローディング状態
   */
  isUnlocking?: boolean

  /**
   * ユーザーの現在のポイント残高
   */
  userPoints?: number
}

/**
 * 鑑定結果表示コンポーネント
 *
 * 鑑定結果（ぼかし/全文）を表示します
 */
export default function DivinationResult({
  divination,
  onUnlock,
  isUnlocking = false,
  userPoints = 0,
}: Props) {
  const UNLOCK_COST = 1000
  const hasEnoughPoints = userPoints >= UNLOCK_COST

  const handleUnlock = async () => {
    if (onUnlock && !isUnlocking && hasEnoughPoints) {
      await onUnlock(divination.id)
    }
  }

  return (
    <div className="space-y-4 my-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* 鑑定結果カード */}
      <div className="bg-[#ffd4e5] rounded-2xl px-6 py-5 shadow-2xl border-2 border-spiritual-pink/50 relative overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-300">
        {/* 装飾用の背景パターン */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-spiritual-pink/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-spiritual-pink-dark animate-pulse" />
              <h3 className="font-bold text-base md:text-lg text-gray-900">鑑定結果</h3>
            </div>
            {!divination.isUnlocked && divination.resultLength && (
              <div className="text-xs md:text-sm text-spiritual-pink-dark font-medium">
                {divination.resultLength}文字
              </div>
            )}
          </div>

          {/* 鑑定結果本文 */}
          <div className="relative">
            {divination.isUnlocked && divination.resultFull ? (
              /* 開封済み: 全文を表示 */
              <div className="text-sm md:text-base text-gray-900 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-800">
                {divination.resultFull}
              </div>
            ) : (
              /* 未開封: プレビュー + ぼかし効果 */
              <div className="space-y-4">
                {/* プレビュー（最初の20文字） */}
                <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {divination.resultPreview}
                </p>

                {/* ぼかし効果のテキスト */}
                <div className="relative min-h-[200px]">
                  <div
                    className="text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed"
                    style={{
                      filter: 'blur(20px)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      opacity: 0.8,
                    }}
                  >
                    {/* ダミーテキスト（実際の内容ではなく、視覚効果のみ） */}
                    あなたの運勢について、詳しく占った結果をお伝えします。現在の状況を見ると、大きな転換期を迎えようとしているようです。これまでの努力が実を結び、新しい展開が期待できます。ただし、焦りは禁物です。一歩ずつ着実に進むことが大切です。人間関係においても良い変化が訪れるでしょう。周囲の人々との絆を大切にすることで、さらなる幸運を引き寄せることができます。金運も上昇の兆しが見えています。
                  </div>

                  {/* 「全文を読む」ボタンまたは「今すぐチャージ」ボタン */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {hasEnoughPoints ? (
                      <button
                        onClick={handleUnlock}
                        disabled={isUnlocking}
                        className="group relative px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 text-spiritual-dark rounded-xl font-bold text-sm md:text-base shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 hover:scale-105 active:scale-95 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 disabled:text-gray-400 transition-all duration-300 flex items-center gap-2 md:gap-3 border-2 border-spiritual-gold/60 overflow-hidden min-h-[48px]"
                      >
                        {/* 輝きエフェクト */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                        <div className="relative z-10 flex items-center gap-2 md:gap-3">
                          {isUnlocking ? (
                            <>
                              <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                              <span>開封中...</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 md:w-6 md:h-6" />
                              <span>すべて読む</span>
                              <span className="text-xs md:text-sm font-normal opacity-90">(1000pt)</span>
                            </>
                          )}
                        </div>
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="px-4 py-3 bg-white/95 border-2 border-red-500 rounded-lg text-red-600 text-sm font-bold shadow-lg text-center">
                          <div>⚠️ ポイントが不足しています</div>
                          <div className="text-xs mt-1 font-normal">
                            開封に必要: <span className="font-bold">{UNLOCK_COST}pt</span> ／ 残高: <span className="font-bold">{userPoints}pt</span>
                          </div>
                        </div>
                        <Link
                          href="/points/purchase"
                          className="group relative px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 text-spiritual-dark rounded-xl font-bold text-sm md:text-base shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 md:gap-3 border-2 border-spiritual-gold/60 overflow-hidden min-h-[48px]"
                        >
                          {/* 輝きエフェクト */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                          <div className="relative z-10 flex items-center gap-2 md:gap-3">
                            <Coins className="w-5 h-5 md:w-6 md:h-6" />
                            <span>今すぐチャージ</span>
                          </div>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 開封済みバッジ */}
          {divination.isUnlocked && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-spiritual-pink-dark/20 border border-spiritual-pink-dark/40 backdrop-blur-sm text-spiritual-pink-dark rounded-full text-sm font-semibold animate-in fade-in slide-in-from-left-4 duration-500 delay-500 shadow-lg"
            style={{ animationDelay: '500ms' }}>
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>開封済み</span>
              {divination.pointsConsumed && (
                <span className="text-xs opacity-90">({divination.pointsConsumed}pt消費)</span>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
