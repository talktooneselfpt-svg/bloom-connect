'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// アプリの定義
const availableApps = [
  {
    id: 'staff',
    name: 'スタッフ管理',
    description: '職員情報の管理',
    path: '/staff',
    icon: '👥',
    color: 'bg-blue-500',
  },
  {
    id: 'clients',
    name: '利用者管理',
    description: '利用者情報の管理',
    path: '/clients',
    icon: '🏥',
    color: 'bg-green-500',
  },
  {
    id: 'organizations',
    name: '事業所設定',
    description: '事業所情報の管理',
    path: '/organizations',
    icon: '🏢',
    color: 'bg-purple-500',
  },
  {
    id: 'reports',
    name: 'レポート',
    description: '各種レポートの確認',
    path: '/reports',
    icon: '📊',
    color: 'bg-yellow-500',
  },
  {
    id: 'mypage',
    name: 'マイページ',
    description: 'プランと決済管理',
    path: '/mypage',
    icon: '⚙️',
    color: 'bg-indigo-500',
  },
  {
    id: 'community',
    name: 'コミュニティ',
    description: 'コミュニティ情報',
    path: '/community',
    icon: '💬',
    color: 'bg-pink-500',
  },
];

// サンプル通知データ
const sampleNotifications = [
  {
    id: 1,
    title: '新しいスタッフが登録されました',
    message: '山田太郎さんが職員として登録されました',
    time: '10分前',
    type: 'info',
    read: false,
  },
  {
    id: 2,
    title: '利用者情報が更新されました',
    message: '鈴木花子さんの情報が更新されました',
    time: '1時間前',
    type: 'success',
    read: false,
  },
  {
    id: 3,
    title: 'レポートが作成されました',
    message: '月次レポートが作成されました',
    time: '2時間前',
    type: 'info',
    read: true,
  },
  {
    id: 4,
    title: 'プラン更新のお知らせ',
    message: '来月のプラン更新日が近づいています',
    time: '1日前',
    type: 'warning',
    read: true,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [favoriteAppIds, setFavoriteAppIds] = useState<string[]>(['staff', 'clients', 'reports']);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  // よく使うアプリ
  const favoriteApps = availableApps.filter(app => favoriteAppIds.includes(app.id));

  // その他のアプリ
  const otherApps = availableApps.filter(app => !favoriteAppIds.includes(app.id));

  const toggleFavorite = (appId: string) => {
    if (favoriteAppIds.includes(appId)) {
      setFavoriteAppIds(favoriteAppIds.filter(id => id !== appId));
    } else {
      setFavoriteAppIds([...favoriteAppIds, appId]);
    }
  };

  const markAsRead = (notificationId: number) => {
    setNotifications(notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ホーム</h1>
          <p className="text-gray-600 mt-2">ブルームコネクトへようこそ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム - よく使うアプリ */}
          <div className="lg:col-span-2 space-y-6">
            {/* よく使うアプリセクション */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">よく使うアプリ</h2>
                <button
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isEditMode
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {isEditMode ? '完了' : '編集'}
                </button>
              </div>

              {favoriteApps.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteApps.map((app) => (
                    <div
                      key={app.id}
                      className="relative border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer group"
                      onClick={() => !isEditMode && router.push(app.path)}
                    >
                      {isEditMode && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(app.id);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                        >
                          ×
                        </button>
                      )}
                      <div className="flex items-center gap-4">
                        <div className={`${app.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl`}>
                          {app.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.name}</h3>
                          <p className="text-sm text-gray-600">{app.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">よく使うアプリを追加してください</p>
              )}

              {/* 編集モード時にその他のアプリを表示 */}
              {isEditMode && otherApps.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">追加可能なアプリ</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherApps.map((app) => (
                      <button
                        key={app.id}
                        onClick={() => toggleFavorite(app.id)}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`${app.color} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}>
                            {app.icon}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{app.name}</h4>
                            <p className="text-xs text-gray-600">{app.description}</p>
                          </div>
                          <div className="ml-auto">
                            <span className="text-green-600 text-xl">+</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右カラム - 通知 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">通知</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        getNotificationColor(notification.type)
                      } ${notification.read ? 'opacity-60' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-700 mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">通知はありません</p>
                )}
              </div>

              <button
                onClick={() => router.push('/notifications')}
                className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                すべての通知を見る →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
