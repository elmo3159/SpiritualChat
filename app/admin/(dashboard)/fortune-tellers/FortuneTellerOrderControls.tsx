'use client'

import { ArrowUp, ArrowDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  fortuneTellerId: string
  currentOrder: number
  isFirst: boolean
  isLast: boolean
}

export default function FortuneTellerOrderControls({
  fortuneTellerId,
  currentOrder,
  isFirst,
  isLast,
}: Props) {
  const router = useRouter()

  const handleMove = async (direction: 'up' | 'down') => {
    try {
      const response = await fetch('/api/admin/fortune-tellers/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fortuneTellerId,
          direction,
        }),
      })

      if (!response.ok) {
        throw new Error('並び替えに失敗しました')
      }

      router.refresh()
    } catch (error) {
      console.error('並び替えエラー:', error)
      alert('並び替えに失敗しました')
    }
  }

  return (
    <div className="flex gap-1">
      <button
        onClick={() => handleMove('up')}
        disabled={isFirst}
        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        title="上に移動"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleMove('down')}
        disabled={isLast}
        className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        title="下に移動"
      >
        <ArrowDown className="w-4 h-4" />
      </button>
    </div>
  )
}
