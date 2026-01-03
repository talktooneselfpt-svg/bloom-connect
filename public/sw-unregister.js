// 古いService Workerを削除するスクリプト
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Service Worker unregistered:', registration);
    }
  });

  // キャッシュも削除
  caches.keys().then(function(cacheNames) {
    return Promise.all(
      cacheNames.map(function(cacheName) {
        console.log('Deleting cache:', cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}
