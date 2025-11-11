import ZustandTest from '@/app/components/test/ZustandTest'

/**
 * Zustand状態管理のテストページ
 *
 * 開発用のテストページです。
 * 本番環境では削除してください。
 */
export default function ZustandTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-gold-50 p-8">
      <ZustandTest />
    </div>
  )
}
