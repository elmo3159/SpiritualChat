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
 * 豪華なコーナー装飾SVGコンポーネント
 */
function OrnateCorner({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* メインのスクロール装飾 */}
      <path
        d="M5 55 Q5 30 15 20 Q20 15 25 18 Q30 21 28 28 Q26 35 18 32 Q12 30 15 25"
        stroke="url(#goldGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M55 5 Q30 5 20 15 Q15 20 18 25 Q21 30 28 28 Q35 26 32 18 Q30 12 25 15"
        stroke="url(#goldGradient)"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* 内側のカール */}
      <path
        d="M10 50 Q10 35 18 28 Q22 25 25 27 Q28 29 26 33 Q24 37 20 35"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 10 Q35 10 28 18 Q25 22 27 25 Q29 28 33 26 Q37 24 35 20"
        stroke="url(#goldGradient)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* 小さな装飾ドット */}
      <circle cx="22" cy="22" r="2" fill="url(#goldGradient)" />
      <circle cx="15" cy="28" r="1.5" fill="url(#goldGradient)" opacity="0.7" />
      <circle cx="28" cy="15" r="1.5" fill="url(#goldGradient)" opacity="0.7" />
      {/* グラデーション定義 */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F4D03F" />
          <stop offset="25%" stopColor="#DAA520" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="75%" stopColor="#DAA520" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/**
 * 豪華なボーダー装飾SVGコンポーネント
 */
function OrnateBorder() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* 四隅の装飾 */}
      <OrnateCorner className="absolute -top-2 -left-2 drop-shadow-lg" />
      <OrnateCorner className="absolute -top-2 -right-2 rotate-90 drop-shadow-lg" />
      <OrnateCorner className="absolute -bottom-2 -left-2 -rotate-90 drop-shadow-lg" />
      <OrnateCorner className="absolute -bottom-2 -right-2 rotate-180 drop-shadow-lg" />

      {/* 上下のボーダーライン装飾 */}
      <div className="absolute top-0 left-12 right-12 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
      <div className="absolute bottom-0 left-12 right-12 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />

      {/* 左右のボーダーライン装飾 */}
      <div className="absolute left-0 top-12 bottom-12 w-[3px] bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-80" />
      <div className="absolute right-0 top-12 bottom-12 w-[3px] bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-80" />
    </div>
  )
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

      {/* 鑑定結果カード - 豪華なフレーム付き */}
      <div className="relative p-3">
        {/* 外側のグロー効果 */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-yellow-300/30 to-amber-400/20 rounded-3xl blur-xl animate-pulse" />

        {/* 豪華なフレーム装飾 */}
        <OrnateBorder />

        {/* メインカード */}
        <div className="relative bg-gradient-to-br from-[#fff5e6] via-[#ffecd2] to-[#ffd4e5] rounded-2xl px-6 py-5 shadow-2xl border-4 border-double border-amber-400/60 overflow-hidden animate-in fade-in zoom-in-95 duration-500 delay-300"
          style={{
            boxShadow: `
              0 0 20px rgba(218, 165, 32, 0.3),
              0 0 40px rgba(218, 165, 32, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.8),
              inset 0 -1px 0 rgba(0, 0, 0, 0.05)
            `
          }}
        >
          {/* 装飾用の背景パターン */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-200/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-pink-200/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-amber-100/20 via-white/30 to-pink-100/20 rounded-full blur-3xl"></div>

          {/* 微細なパターンオーバーレイ */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23DAA520' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            {/* ヘッダー部分 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7 text-amber-500 animate-pulse drop-shadow-lg" />
                  <div className="absolute inset-0 w-6 h-6 md:w-7 md:h-7 bg-amber-400/50 rounded-full blur-md animate-pulse" />
                </div>
                <h3 className="font-bold text-lg md:text-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent drop-shadow-sm">
                  鑑定結果
                </h3>
              </div>
              {!divination.isUnlocked && divination.resultLength && (
                <div className="text-xs md:text-sm text-amber-700 font-semibold bg-amber-100/50 px-3 py-1 rounded-full border border-amber-300/50">
                  {divination.resultLength}文字
                </div>
              )}
            </div>

            {/* 鑑定結果本文 */}
            <div className="relative">
              {divination.isUnlocked && divination.resultFull ? (
                /* 開封済み: 全文を表示 */
                <div className="text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed animate-in fade-in duration-800 bg-white/40 rounded-xl p-4 border border-amber-200/50">
                  {divination.resultFull}
                </div>
              ) : (
                /* 未開封: プレビュー + 神秘的なぼかし効果 */
                <div className="space-y-4">
                  {/* プレビュー（最初の20文字） */}
                  <p className="text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed bg-white/40 rounded-xl p-4 border border-amber-200/50">
                    {divination.resultPreview}
                  </p>

                  {/* 神秘的なぼかしエリア - 豪華なフレーム付き */}
                  <div className="relative rounded-xl overflow-hidden min-h-[280px]">
                    {/* 内側の豪華なボーダー */}
                    <div className="absolute inset-0 rounded-xl border-4 border-double border-amber-400/40 pointer-events-none z-20"
                      style={{
                        boxShadow: `
                          inset 0 0 20px rgba(218, 165, 32, 0.2),
                          inset 0 0 40px rgba(218, 165, 32, 0.1)
                        `
                      }}
                    />

                    {/* グラデーション霧の背景 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-50/80 via-purple-100/60 to-pink-100/80"></div>

                    {/* アニメーションする霧エフェクト */}
                    <div className="absolute inset-0 opacity-70">
                      <div className="absolute top-0 left-1/4 w-40 h-40 bg-amber-200/50 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-pink-200/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-200/50 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                    </div>

                    {/* キラキラ星のアニメーション */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(15)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute animate-twinkle"
                          style={{
                            left: `${10 + (i * 6) % 80}%`,
                            top: `${10 + (i * 9) % 80}%`,
                            animationDelay: `${i * 0.25}s`,
                          }}
                        >
                          <Star className="w-3 h-3 text-amber-500/80 fill-amber-400/60 drop-shadow-lg" />
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">

                      {/* 残り文字数の価値訴求 */}
                      <div className="mb-4 text-center">
                        <p className="text-amber-700 font-bold text-base">
                          あと <span className="text-2xl bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">{remainingChars}</span> 文字
                        </p>
                        <p className="text-xs text-gray-600 mt-1">あなただけの特別な鑑定結果</p>
                      </div>

                      {/* 開封ボタン - 超豪華版 */}
                      <div className="relative">
                        {/* ボタンの外側グロー */}
                        <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-2xl blur-lg opacity-60 animate-pulse" />

                        {/* ボタン装飾フレーム */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-xl opacity-80" />

                        <button
                          onClick={handleUnlock}
                          disabled={isUnlocking}
                          className="relative group px-8 py-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-amber-900 rounded-xl font-bold text-base shadow-2xl hover:shadow-amber-400/60 hover:scale-105 active:scale-95 disabled:from-gray-500 disabled:via-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:scale-100 disabled:text-gray-600 transition-all duration-300 overflow-hidden"
                          style={{
                            boxShadow: `
                              0 4px 15px rgba(218, 165, 32, 0.4),
                              0 8px 30px rgba(218, 165, 32, 0.2),
                              inset 0 1px 0 rgba(255, 255, 255, 0.5),
                              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                            `,
                            textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)'
                          }}
                        >
                          {/* 輝きエフェクト */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                          {/* 内側のハイライト */}
                          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-t-xl" />

                          <div className="relative z-10 flex items-center gap-3">
                            {isUnlocking ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>開封中...</span>
                              </>
                            ) : (
                              <>
                                <div className="relative">
                                  <Lock className="w-5 h-5" />
                                  <div className="absolute inset-0 bg-amber-600/30 rounded-full blur-sm animate-pulse" />
                                </div>
                                <span className="text-lg">全文を読む</span>
                                <span className="text-sm font-semibold bg-amber-600/20 px-3 py-1 rounded-full border border-amber-600/30">
                                  {UNLOCK_COST}pt
                                </span>
                              </>
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 開封済みバッジ */}
            {divination.isUnlocked && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-amber-50 border-2 border-amber-400/50 backdrop-blur-sm text-amber-700 rounded-full text-sm font-semibold animate-in fade-in slide-in-from-left-4 duration-500 delay-500"
                style={{
                  animationDelay: '500ms',
                  boxShadow: '0 2px 10px rgba(218, 165, 32, 0.2)'
                }}>
                <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                <span>開封済み</span>
                {divination.pointsConsumed && (
                  <span className="text-xs opacity-80">({divination.pointsConsumed}pt消費)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
