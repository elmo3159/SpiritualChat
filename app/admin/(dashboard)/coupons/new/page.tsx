import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CouponForm from '../CouponForm'

/**
 * クーポン新規作成ページ
 */
export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/coupons"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">クーポン新規作成</h1>
          <p className="text-sm text-gray-600 mt-1">
            新しい割引クーポンを作成します
          </p>
        </div>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <CouponForm />
      </div>
    </div>
  )
}
