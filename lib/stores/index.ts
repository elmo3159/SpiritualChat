/**
 * Zustand状態管理ストア
 *
 * このディレクトリには、アプリ全体で使用される状態管理ストアが含まれています。
 *
 * ## Next.js 14 App Routerでの使用方法
 *
 * ### 重要な注意事項
 * - これらのストアは **Client Components でのみ** 使用してください
 * - Server Components ではストアを使用できません
 * - データ取得は Server Components で行い、状態管理は最小限に留めてください
 *
 * ### 使用例
 *
 * ```tsx
 * 'use client' // この行を忘れずに！
 *
 * import { useUIStore, usePointsStore } from '@/lib/stores'
 *
 * export default function Header() {
 *   const { isMenuOpen, toggleMenu } = useUIStore()
 *   const { points } = usePointsStore()
 *
 *   return (
 *     <header>
 *       <button onClick={toggleMenu}>Menu</button>
 *       <div>ポイント: {points}pt</div>
 *     </header>
 *   )
 * }
 * ```
 *
 * @module stores
 */

export { useUIStore } from './ui-store'
export { usePointsStore } from './points-store'
