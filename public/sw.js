/**
 * Service Worker for PWA
 *
 * キャッシュ戦略: Cache First（画像、スタイル）、Network First（API、HTML）
 */

const CACHE_NAME = 'spichat-v1'
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html', // オフライン用フォールバックページ
]

// インストール時: 静的ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE_URLS)
    })
  )
  self.skipWaiting()
})

// アクティベーション時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// フェッチ時: キャッシュ戦略を適用
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // 外部リソースはキャッシュしない
  if (url.origin !== location.origin) {
    return
  }

  // 画像、フォント、CSSはCache First
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // API、HTMLはNetwork First
  event.respondWith(networkFirst(request))
})

/**
 * Cache First戦略
 * キャッシュを優先、なければネットワークから取得
 */
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('Fetch failed:', error)
    throw error
  }
}

/**
 * Network First戦略
 * ネットワークを優先、失敗したらキャッシュから返す
 */
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }

    // オフライン用フォールバック
    if (request.destination === 'document') {
      return cache.match('/offline.html')
    }

    throw error
  }
}
