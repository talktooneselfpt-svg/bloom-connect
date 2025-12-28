// ブルームコネクト - Service Worker
// キャッシュ名（バージョン管理用）
const CACHE_NAME = 'bloom-connect-v1';
const RUNTIME_CACHE = 'bloom-connect-runtime';

// キャッシュするリソース（静的ファイル）
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html',
];

// インストール時：静的リソースをキャッシュ
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching static resources');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// アクティベーション時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチ時：ネットワーク優先、フォールバックでキャッシュ
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 同一オリジンのリクエストのみ処理
  if (url.origin !== location.origin) {
    return;
  }

  // GETリクエストのみキャッシュ
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // レスポンスが正常な場合、ランタイムキャッシュに保存
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時、キャッシュから取得
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // オフライン用ページを返す（HTMLリクエストの場合）
          if (request.headers.get('accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// プッシュ通知受信時
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'ブルームコネクト', body: event.data.text() };
    }
  }

  const title = data.title || 'ブルームコネクト';
  const options = {
    body: data.body || '新しい通知があります',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: data,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知クリック時
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // 既に開いているウィンドウがあればフォーカス
        for (let client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // なければ新しいウィンドウを開く
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});
