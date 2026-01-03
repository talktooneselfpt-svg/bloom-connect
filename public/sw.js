// Bloom Connect Service Worker
// オフライン対応とキャッシング戦略を実装

const CACHE_NAME = 'bloom-connect-v1'
const RUNTIME_CACHE = 'bloom-connect-runtime-v1'

// 静的アセットのキャッシュ対象
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// オフライン時のフォールバックページ
const OFFLINE_PAGE = '/offline.html'

// インストール時: 静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker')

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )

  // 新しいService Workerをすぐに有効化
  self.skipWaiting()
})

// アクティベート時: 古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker')

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )

  // すべてのクライアントを即座に制御
  self.clients.claim()
})

// フェッチ時: キャッシング戦略を適用
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Chrome拡張機能のリクエストは無視
  if (url.protocol === 'chrome-extension:') {
    return
  }

  // Firebase APIへのリクエスト: Network First戦略
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('identitytoolkit.googleapis.com') ||
      url.hostname.includes('storage.googleapis.com')) {
    event.respondWith(networkFirst(request))
    return
  }

  // ナビゲーションリクエスト（ページ遷移）: Network First + オフライン時はフォールバック
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match(OFFLINE_PAGE).then((response) => {
            return response || new Response('オフラインです', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            })
          })
        })
    )
    return
  }

  // 静的アセット（JS、CSS、画像等）: Cache First戦略
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(cacheFirst(request))
    return
  }

  // その他のリクエスト: Network First戦略
  event.respondWith(networkFirst(request))
})

// Cache First戦略: キャッシュ優先、なければネットワーク
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Fetch failed:', error)
    throw error
  }
}

// Network First戦略: ネットワーク優先、失敗時はキャッシュ
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// メッセージハンドラ: クライアントからのメッセージを処理
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.payload)
      })
    )
  }
})
