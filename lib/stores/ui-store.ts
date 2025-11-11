import { create } from 'zustand'

/**
 * UI状態の型定義
 */
interface UIState {
  // ハンバーガーメニューの開閉状態
  isMenuOpen: boolean
  // モーダルの開閉状態
  isModalOpen: boolean
  // モーダルのコンテンツタイプ
  modalContent: 'points' | 'history' | 'profile' | null
  // ローディング状態
  isLoading: boolean
  // エラーメッセージ
  error: string | null

  // アクション
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
  openModal: (content: 'points' | 'history' | 'profile') => void
  closeModal: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

/**
 * UIストア
 *
 * アプリ全体のUI状態を管理します。
 * Next.js 14 App Routerのベストプラクティスに従い、
 * Server Componentsでは使用せず、Client Componentsでのみ使用します。
 *
 * @example
 * ```tsx
 * 'use client'
 * import { useUIStore } from '@/lib/stores/ui-store'
 *
 * export default function Menu() {
 *   const { isMenuOpen, toggleMenu } = useUIStore()
 *   return <button onClick={toggleMenu}>Menu</button>
 * }
 * ```
 */
export const useUIStore = create<UIState>((set) => ({
  // 初期状態
  isMenuOpen: false,
  isModalOpen: false,
  modalContent: null,
  isLoading: false,
  error: null,

  // アクション
  openMenu: () => set({ isMenuOpen: true }),
  closeMenu: () => set({ isMenuOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),

  openModal: (content) => set({ isModalOpen: true, modalContent: content }),
  closeModal: () => set({ isModalOpen: false, modalContent: null }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}))
