'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Notification, NotificationType, NotificationCategory, NotificationPriority } from '@/types/notification'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
  NOTIFICATION_CATEGORY_COLORS,
  NOTIFICATION_PRIORITY_COLORS,
} from '@/types/notification'
import {
  getUserNotifications,
  markNotificationAsRead,
  markMultipleNotificationsAsRead,
  archiveNotification,
  toggleNotificationPin,
  deleteNotification,
} from '@/lib/firestore/notifications'
import { Timestamp } from 'firebase/firestore'

// サンプルデータ
const SAMPLE_NOTIFICATIONS: Partial<Notification>[] = [
  {
    id: '1',
    type: 'organization',
    category: 'announcement',
    priority: 'high',
    title: '重要なお知らせ',
    message: '明日のシフトについて変更があります。確認をお願いします。',
    link: '/shift',
    linkText: 'シフトを確認',
    organizationId: 'org-001',
    senderId: 'admin-001',
    senderName: '管理者',
    isRead: false,
    isArchived: false,
    isPinned: true,
    createdAt: Timestamp.fromDate(new Date('2025-01-15 10:00')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-15 10:00')),
  },
  {
    id: '2',
    type: 'system',
    category: 'update',
    priority: 'normal',
    title: '新機能のお知らせ',
    message: 'エクスポート機能が追加されました。職員一覧や利用者一覧からCSV/HTMLでのエクスポートが可能です。',
    link: '/staff',
    linkText: '詳細を見る',
    isRead: false,
    isArchived: false,
    isPinned: false,
    createdAt: Timestamp.fromDate(new Date('2025-01-14 15:30')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-14 15:30')),
  },
  {
    id: '3',
    type: 'organization',
    category: 'reminder',
    priority: 'normal',
    title: '研修のリマインダー',
    message: '本日17:00から職員研修があります。',
    isRead: true,
    isArchived: false,
    isPinned: false,
    createdAt: Timestamp.fromDate(new Date('2025-01-13 09:00')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-13 09:00')),
    readAt: Timestamp.fromDate(new Date('2025-01-13 09:15')),
  },
  {
    id: '4',
    type: 'system',
    category: 'maintenance',
    priority: 'urgent',
    title: 'メンテナンスのお知らせ',
    message: '1月20日 2:00-4:00にシステムメンテナンスを実施します。',
    isRead: true,
    isArchived: false,
    isPinned: false,
    createdAt: Timestamp.fromDate(new Date('2025-01-12 14:00')),
    updatedAt: Timestamp.fromDate(new Date('2025-01-12 14:00')),
    readAt: Timestamp.fromDate(new Date('2025-01-12 16:30')),
  },
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Partial<Notification>[]>([])
  const [loading, setLoading] = useState(false)

  // フィルター状態
  const [filterType, setFilterType] = useState<'all' | NotificationType>('all')
  const [filterRead, setFilterRead] = useState<'all' | 'read' | 'unread'>('all')
  const [includeArchived, setIncludeArchived] = useState(false)

  // TODO: 実際のユーザーIDと組織IDを取得
  const currentUserId = 'test-user-001'
  const currentOrganizationId = 'test-org-001'

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      // TODO: Firestoreから取得
      setNotifications(SAMPLE_NOTIFICATIONS)
    } catch (error) {
      console.error('通知の取得に失敗しました:', error)
    } finally {
      setLoading(false)
    }
  }

  // フィルタリング
  const filteredNotifications = useMemo(() => {
    let filtered = [...notifications]

    // タイプフィルター
    if (filterType !== 'all') {
      filtered = filtered.filter((n) => n.type === filterType)
    }

    // 既読フィルター
    if (filterRead === 'read') {
      filtered = filtered.filter((n) => n.isRead)
    } else if (filterRead === 'unread') {
      filtered = filtered.filter((n) => !n.isRead)
    }

    // アーカイブフィルター
    if (!includeArchived) {
      filtered = filtered.filter((n) => !n.isArchived)
    }

    // ピン留めを先頭に、その後は日時順
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      const aTime = a.createdAt?.toMillis() || 0
      const bTime = b.createdAt?.toMillis() || 0
      return bTime - aTime
    })

    return filtered
  }, [notifications, filterType, filterRead, includeArchived])

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: Timestamp.now() } : n))
      )
    } catch (error) {
      alert('既読処理に失敗しました')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id!)
      await markMultipleNotificationsAsRead(unreadIds)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: Timestamp.now() })))
    } catch (error) {
      alert('一括既読処理に失敗しました')
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await archiveNotification(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isArchived: true } : n)))
    } catch (error) {
      alert('アーカイブに失敗しました')
    }
  }

  const handleTogglePin = async (id: string, currentPinned: boolean) => {
    try {
      await toggleNotificationPin(id, !currentPinned)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isPinned: !currentPinned } : n)))
    } catch (error) {
      alert('ピン留めの切り替えに失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この通知を削除しますか？')) return

    try {
      await deleteNotification(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      alert('削除に失敗しました')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">通知</h1>
              <p className="text-gray-600 mt-2">
                未読 {unreadCount}件 / 全{' '}
                {notifications.filter((n) => !n.isArchived).length}件
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/notifications/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                通知を作成
              </Link>
              <Link
                href="/notifications/settings"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                設定
              </Link>
            </div>
          </div>
        </div>

        {/* フィルター・アクション */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* タイプフィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">種類:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | NotificationType)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="organization">事業所</option>
                <option value="system">運営</option>
              </select>
            </div>

            {/* 既読フィルター */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">状態:</label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value as 'all' | 'read' | 'unread')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべて</option>
                <option value="unread">未読のみ</option>
                <option value="read">既読のみ</option>
              </select>
            </div>

            {/* アーカイブ表示 */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">アーカイブを表示</span>
            </label>

            {/* 一括既読 */}
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              すべて既読
            </button>
          </div>
        </div>

        {/* 通知一覧 */}
        {loading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            通知がありません
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              if (!notification.id) return null

              const typeColor = notification.type === 'organization' ? 'blue' : 'purple'
              const categoryColors = NOTIFICATION_CATEGORY_COLORS[notification.category!]
              const priorityColors = NOTIFICATION_PRIORITY_COLORS[notification.priority!]

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow p-4 transition-all ${
                    notification.isPinned ? 'border-2 border-yellow-400' : ''
                  } ${notification.isRead ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* ヘッダー */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {/* タイプバッジ */}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded bg-${typeColor}-100 text-${typeColor}-800`}
                        >
                          {NOTIFICATION_TYPE_LABELS[notification.type!]}
                        </span>

                        {/* カテゴリーバッジ */}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${categoryColors.bg} ${categoryColors.text}`}
                        >
                          {NOTIFICATION_CATEGORY_LABELS[notification.category!]}
                        </span>

                        {/* 優先度バッジ */}
                        {notification.priority !== 'normal' && (
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${priorityColors.bg} ${priorityColors.text}`}
                          >
                            {NOTIFICATION_PRIORITY_LABELS[notification.priority!]}
                          </span>
                        )}

                        {/* ピン留めアイコン */}
                        {notification.isPinned && (
                          <span className="text-yellow-500" title="ピン留め">
                            📌
                          </span>
                        )}

                        {/* 未読インジケーター */}
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                      </div>

                      {/* タイトルとメッセージ */}
                      <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                      <p className="text-gray-700 text-sm mb-2">{notification.message}</p>

                      {/* リンク */}
                      {notification.link && (
                        <Link
                          href={notification.link}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          {notification.linkText || '詳細を見る'} →
                        </Link>
                      )}

                      {/* 送信者と日時 */}
                      <div className="mt-2 text-xs text-gray-500">
                        {notification.senderName && <span>{notification.senderName} • </span>}
                        {notification.createdAt?.toDate().toLocaleString('ja-JP')}
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex flex-col gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id!)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="既読にする"
                        >
                          ✓
                        </button>
                      )}

                      <button
                        onClick={() => handleTogglePin(notification.id!, notification.isPinned!)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title={notification.isPinned ? 'ピン留めを解除' : 'ピン留め'}
                      >
                        📌
                      </button>

                      {!notification.isArchived && (
                        <button
                          onClick={() => handleArchive(notification.id!)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="アーカイブ"
                        >
                          📦
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(notification.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
