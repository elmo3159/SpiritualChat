'use client'

/**
 * タイピングインジケーターコンポーネント
 *
 * 占い師が入力中であることを示すアニメーション
 */
export default function TypingIndicator({
  fortuneTellerName,
  fortuneTellerAvatar,
}: {
  fortuneTellerName: string
  fortuneTellerAvatar: string
}) {
  return (
    <div className="flex gap-3 mb-4">
      {/* 占い師のアバター */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden ring-2 ring-spiritual-lavender/50 shadow-lg bg-spiritual-purple/20">
          <img
            src={fortuneTellerAvatar}
            alt={fortuneTellerName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      </div>

      {/* タイピングインジケーターバブル */}
      <div className="flex-1 max-w-[70%]">
        <div className="bg-gradient-to-br from-spiritual-lavender/90 to-spiritual-lavender-light/90 backdrop-blur-sm rounded-2xl rounded-tl-none px-4 py-3 shadow-lg border border-spiritual-lavender/30">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">文章を入力中</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
