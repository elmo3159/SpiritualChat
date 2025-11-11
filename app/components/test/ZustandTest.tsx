'use client'

import { useUIStore, usePointsStore } from '@/lib/stores'

/**
 * Zustandストアのテストコンポーネント
 *
 * このコンポーネントは開発中のテスト用です。
 * 本番環境では削除してください。
 */
export default function ZustandTest() {
  const {
    isMenuOpen,
    isModalOpen,
    modalContent,
    toggleMenu,
    openModal,
    closeModal,
    setError,
    clearError,
    error,
  } = useUIStore()

  const { points, addPoints, subtractPoints, setPoints } = usePointsStore()

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-purple-600">
        Zustand状態管理テスト
      </h2>

      {/* UI Store Test */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold">UI Store</h3>

        {/* Menu State */}
        <div className="space-y-2">
          <p className="text-sm">
            メニュー状態:{' '}
            <span className="font-bold">
              {isMenuOpen ? '開いています' : '閉じています'}
            </span>
          </p>
          <button
            onClick={toggleMenu}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            メニュー切り替え
          </button>
        </div>

        {/* Modal State */}
        <div className="space-y-2">
          <p className="text-sm">
            モーダル状態:{' '}
            <span className="font-bold">
              {isModalOpen ? `開いています (${modalContent})` : '閉じています'}
            </span>
          </p>
          <div className="space-x-2">
            <button
              onClick={() => openModal('points')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ポイントモーダル
            </button>
            <button
              onClick={() => openModal('history')}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              履歴モーダル
            </button>
            <button
              onClick={() => openModal('profile')}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              プロフィールモーダル
            </button>
            {isModalOpen && (
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                閉じる
              </button>
            )}
          </div>
        </div>

        {/* Error State */}
        <div className="space-y-2">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded">
              エラー: {error}
              <button
                onClick={clearError}
                className="ml-4 text-red-900 underline"
              >
                クリア
              </button>
            </div>
          )}
          <button
            onClick={() => setError('テストエラーメッセージ')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            エラー表示
          </button>
        </div>
      </div>

      {/* Points Store Test */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-xl font-semibold">Points Store</h3>

        <div className="space-y-2">
          <p className="text-sm">
            現在のポイント:{' '}
            <span className="text-2xl font-bold text-purple-600">{points}</span>{' '}
            pt
          </p>
          <div className="space-x-2">
            <button
              onClick={() => addPoints(100)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              +100pt
            </button>
            <button
              onClick={() => addPoints(500)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              +500pt
            </button>
            <button
              onClick={() => subtractPoints(100)}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              -100pt
            </button>
            <button
              onClick={() => subtractPoints(1000)}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              -1000pt
            </button>
            <button
              onClick={() => setPoints(5000)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              5000ptにセット
            </button>
            <button
              onClick={() => setPoints(0)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              リセット
            </button>
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-500 text-center">
        このコンポーネントは開発用のテストコンポーネントです。
        <br />
        本番環境では削除してください。
      </div>
    </div>
  )
}
