import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

// サイトマップ生成用のSupabaseクライアント（サーバーサイド）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://your-domain.com'
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // 基本的な静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/horoscope`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/tokusho`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // 運勢記事の動的ページを取得（直近90日分）
  // サイトマップの制限（50,000 URL）を考慮して期間を制限
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0]

  const { data: horoscopePosts } = await supabase
    .from('horoscope_posts')
    .select('zodiac_sign_id, post_date, created_at')
    .gte('post_date', ninetyDaysAgoStr)
    .order('post_date', { ascending: false })

  // 運勢記事のURLを生成
  const horoscopePages: MetadataRoute.Sitemap = (horoscopePosts || []).map((post) => ({
    url: `${baseUrl}/horoscope/${post.zodiac_sign_id}/${post.post_date}`,
    lastModified: new Date(post.created_at),
    changeFrequency: 'never' as const, // 運勢は日付固定で変更されない
    priority: 0.7,
  }))

  return [...staticPages, ...horoscopePages]
}
