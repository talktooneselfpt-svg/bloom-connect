'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      // Service Worker登録
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('✅ Service Worker登録成功:', registration.scope);

          // 更新チェック
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  // 新しいService Workerが利用可能
                  console.log('🔄 新しいバージョンが利用可能です');

                  // ユーザーに更新を通知（オプション）
                  if (
                    confirm(
                      '新しいバージョンが利用可能です。\nページを更新しますか？'
                    )
                  ) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('❌ Service Worker登録失敗:', error);
        });

      // Service Worker制御の変更を監視
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Workerが更新されました');
      });
    }
  }, []);

  return null;
}
