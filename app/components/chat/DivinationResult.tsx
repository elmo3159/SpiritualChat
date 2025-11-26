'use client'

import { Lock, Sparkles, Loader2, Star } from 'lucide-react'
import type { DivinationResultDisplay } from '@/lib/types/divination'
import { useRouter } from 'next/navigation'

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
  const router = useRouter()
  const UNLOCK_COST = 500
  const hasEnoughPoints = userPoints >= UNLOCK_COST

  // プレビュー文字数を計算（残りの文字数）
  const previewLength = divination.resultPreview?.length || 0
  const totalLength = divination.resultLength || 400
  const remainingChars = Math.max(0, totalLength - previewLength)

  const handleUnlock = async () => {
    if (isUnlocking) return

    // 残高不足の場合はポイント購入ページへ遷移
    if (!hasEnoughPoints) {
      router.push('/points/purchase')
      return
    }

    // 残高がある場合は開封処理
    if (onUnlock) {
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
              /* 未開封: プレビュー + 神秘的なぼかし効果 */
              <div className="space-y-4">
                {/* プレビュー（最初の20文字） */}
                <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {divination.resultPreview}
                </p>

                {/* 神秘的なぼかしエリア */}
                <div className="relative rounded-xl overflow-hidden min-h-[260px]">
                  {/* グラデーション霧の背景 */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#ffd4e5]/60 via-purple-200/50 to-indigo-200/60"></div>

                  {/* アニメーションする霧エフェクト */}
                  <div className="absolute inset-0 opacity-60">
                    <div className="absolute top-0 left-1/4 w-40 h-40 bg-white/40 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-spiritual-pink/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-300/40 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  </div>

                  {/* キラキラ星のアニメーション */}
                  <div className="absolute inset-0 overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-twinkle"
                        style={{
                          left: `${10 + (i * 7) % 80}%`,
                          top: `${15 + (i * 11) % 70}%`,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      >
                        <Star className="w-3 h-3 text-spiritual-gold/70 fill-spiritual-gold/50" />
                      </div>
                    ))}
                  </div>

                  {/* ぼかしテキスト（うっすら見える程度） */}
                  <div
                    className="absolute inset-0 p-4 text-sm text-gray-600/80"
                    style={{
                      filter: 'blur(8px)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                    }}
                  >
                    あなたの運勢について詳しく占った結果をお伝えします。現在の状況を見ると、大きな転換期を迎えようとしているようです。これまでの努力が実を結び、新しい展開が期待できます。人間関係においても良い変化が訪れるでしょう。周囲の人々との絆を大切にすることで、さらなる幸運を引き寄せることができます。
                  </div>

                  {/* 中央のコンテンツエリア */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3">

                    {/* 残り文字数の価値訴求 */}
                    <div className="mb-3 text-center">
                      <p className="text-spiritual-pink-dark font-bold text-base animate-pulse">
                        あと <span className="text-xl">{remainingChars}</span> 文字
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">あなただけの特別な鑑定結果</p>
                    </div>

                    {/* 開封ボタン - 残高に関わらず同じ見た目 */}
                    <button
                      onClick={handleUnlock}
                      disabled={isUnlocking}
                      className="group relative px-6 py-3 bg-gradient-to-r from-spiritual-accent via-spiritual-gold to-spiritual-accent bg-size-200 bg-pos-0 hover:bg-pos-100 text-spiritual-dark rounded-xl font-bold text-sm shadow-2xl shadow-spiritual-gold/50 hover:shadow-spiritual-gold/70 hover:scale-105 active:scale-95 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 disabled:text-gray-400 transition-all duration-300 flex items-center gap-2 border-2 border-spiritual-gold/60 overflow-hidden"
                    >
                      {/* 輝きエフェクト */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                      <div className="relative z-10 flex items-center gap-2">
                        {isUnlocking ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>開封中...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            <span>全文を読む</span>
                            <span className="text-xs font-normal opacity-90 bg-white/20 px-2 py-0.5 rounded-full">{UNLOCK_COST}pt</span>
                          </>
                        )}
                      </div>
                    </button>
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
