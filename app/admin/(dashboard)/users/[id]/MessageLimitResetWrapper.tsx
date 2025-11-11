'use client'

import { useRouter } from 'next/navigation'
import MessageLimitReset from '@/app/components/admin/MessageLimitReset'

interface MessageLimit {
  fortuneTellerId: string
  fortuneTellerName: string
  currentCount: number
  remainingCount: number
}

interface MessageLimitResetWrapperProps {
  userId: string
  messageLimits: MessageLimit[]
}

/**
 * メッセージ制限リセットのラッパーコンポーネント
 *
 * リセット後にページを再読み込みするためのクライアントコンポーネント
 */
export default function MessageLimitResetWrapper({
  userId,
  messageLimits,
}: MessageLimitResetWrapperProps) {
  const router = useRouter()

  const handleReset = () => {
    // ページを再読み込みして最新の状態を取得
    router.refresh()
  }

  return (
    <MessageLimitReset
      userId={userId}
      messageLimits={messageLimits}
      onReset={handleReset}
    />
  )
}
