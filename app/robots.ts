import { MetadataRoute } from 'next'

/**
 * robots.txtを動的に生成
 *
 * 検索エンジンのクロール制御
 * https://yourdomain.com/robots.txt でアクセス可能
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://localhost:3000'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/*',      // 管理画面は非公開
          '/chat/*',       // ユーザー個別のチャットは非公開
          '/api/*',        // APIエンドポイントは非公開
          '/onboarding',   // オンボーディングは非公開
          '/profile',      // プロフィール編集は非公開
          '/notifications',// 通知ページは非公開
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
