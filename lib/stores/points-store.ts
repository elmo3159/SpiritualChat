import { create } from 'zustand'

/**
 * ポイント残高の型定義
 */
interface PointsState {
  // 現在のポイント残高
  points: number
  // ポイントのロード状態
  isLoading: boolean
  // エラー状態
  error: string | null
  // 最終更新日時
  lastUpdated: Date | null

  // アクション
  setPoints: (points: number) => void
  addPoints: (amount: number) => void
  subtractPoints: (amount: number) => void
  resetPoints: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

/**
 * ポイント残高ストア
 *
 * ユーザーのポイント残高を管理します。
 * 鑑定結果の購入やポイントの追加時にリアルタイムで更新されます。
 *
 * Next.js 14 App Routerのベストプラクティスに従い、
 * Server Componentsでは使用せず、Client Componentsでのみ使用します。
 * 実際のポイント残高はSupabaseから取得し、このストアはUI表示用のキャッシュとして機能します。
 *
 * @example
 * ```tsx
 * 'use client'
 * import { usePointsStore } from '@/lib/stores/points-store'
 *
 * export default function PointsDisplay() {
 *   const { points, isLoading } = usePointsStore()
 *   return <div>{isLoading ? 'Loading...' : `${points}pt`}</div>
 * }
 * ```
 */
export const usePointsStore = create<PointsState>((set) => ({
  // 初期状態
  points: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,

  // アクション
  setPoints: (points) =>
    set({
      points,
      lastUpdated: new Date(),
      error: null,
    }),

  addPoints: (amount) =>
    set((state) => ({
      points: state.points + amount,
      lastUpdated: new Date(),
    })),

  subtractPoints: (amount) =>
    set((state) => ({
      points: Math.max(0, state.points - amount), // ポイントが負にならないようにする
      lastUpdated: new Date(),
    })),

  resetPoints: () =>
    set({
      points: 0,
      isLoading: false,
      error: null,
      lastUpdated: null,
    }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error, isLoading: false }),
}))
