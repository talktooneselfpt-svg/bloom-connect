// ブルームコネクト Service Worker
// バージョン: 1.0.0

const CACHE_NAME = 'bloom-connect-v1';
const RUNTIME_CACHE = 'bloom-connect-runtime-v1';

// キャッシュするリソース（静的ファイル）
const STATIC_CACHE_URLS = [
  '/',
  '/home',
  '/app',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Service Worker インストール
self.addEventListener('install', (event) => {
  console.log('[Service Worker] インストール中...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] 静的ファイルをキャッシュ中...');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );

  // 新しいService Workerをすぐにアクティブ化
  self.skipWaiting();
});

// Service Worker アクティベーション
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] アクティベーション中...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 古いキャッシュを削除
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[Service Worker] 古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // 即座に制御を開始
  return self.clients.claim();
});

// フェッチイベント - キャッシュ戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Firebase、外部API、Chrome拡張機能のリクエストはキャッシュしない
  if (
    url.origin.includes('firestore.googleapis.com') ||
    url.origin.includes('identitytoolkit.googleapis.com') ||
    url.origin.includes('firebase') ||
    url.protocol === 'chrome-extension:'
  ) {
    return;
  }

  // GETリクエストのみキャッシュ
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // キャッシュにあればそれを返す
      if (cachedResponse) {
        // バックグラウンドで更新を取得（Stale-While-Revalidate戦略）
        fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // ネットワークエラーは無視（キャッシュを使用）
        });

        return cachedResponse;
      }

      // キャッシュになければネットワークから取得
      return fetch(request)
        .then((networkResponse) => {
          // レスポンスが有効な場合のみキャッシュ
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type === 'error'
          ) {
            return networkResponse;
          }

          // HTML、CSS、JS、画像をキャッシュ
          const contentType = networkResponse.headers.get('content-type');
          if (
            contentType &&
            (contentType.includes('text/html') ||
             contentType.includes('text/css') ||
             contentType.includes('application/javascript') ||
             contentType.includes('image/'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // ネットワークエラー時、オフラインページを返す
          if (request.destination === 'document') {
            return caches.match('/');
          }
        });
    })
  );
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] バックグラウンド同期:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

// プッシュ通知（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('[Service Worker] プッシュ通知受信');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'ブルームコネクト';
  const options = {
    body: data.body || '新しい通知があります',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: data.url || '/',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知クリック
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] 通知クリック');

  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});

// データ同期処理（将来の実装用プレースホルダー）
async function syncData() {
  try {
    console.log('[Service Worker] データ同期を開始...');
    // TODO: Firestoreとのデータ同期処理を実装
    return Promise.resolve();
  } catch (error) {
    console.error('[Service Worker] データ同期エラー:', error);
    return Promise.reject(error);
  }
}

// メッセージハンドラー（将来の拡張用）
self.addEventListener('message', (event) => {
  console.log('[Service Worker] メッセージ受信:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
