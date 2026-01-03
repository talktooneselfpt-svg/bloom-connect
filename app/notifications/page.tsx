"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from "@/lib/firestore/notifications"
import {
  Notification,
  NotificationCategory,
} from "@/types/notification"

export default function NotificationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "read">("all")
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory | "">("")

  useEffect(() => {
    if (user) {
      loadNotifications()
      loadUnreadCount()
    }
  }, [activeTab, selectedCategory, user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)

      const filter: any = {}
      if (activeTab === "unread") {
        filter.isRead = false
      } else if (activeTab === "read") {
        filter.isRead = true
      }
      if (selectedCategory) {
        filter.category = selectedCategory
      }

      const { notifications: data } = await getUserNotifications(
        user.uid,
        user.customClaims?.eid || "",
        filter,
        50
      )

      setNotifications(data)
    } catch (err) {
      console.error("通知の取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    if (!user) return

    try {
      const count = await getUnreadCount(user.uid, user.customClaims?.eid || "")
      setUnreadCount(count)
    } catch (err) {
      console.error("未読数の取得に失敗しました:", err)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      await loadNotifications()
      await loadUnreadCount()
    } catch (err) {
      console.error("既読マークに失敗しました:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user || !confirm("すべての通知を既読にしますか？")) return

    try {
      await markAllAsRead(user.uid, user.customClaims?.eid || "")
      await loadNotifications()
      await loadUnreadCount()
    } catch (err) {
      alert("既読マークに失敗しました")
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    // 未読の場合は既読にする
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id)
    }

    // アクションURLがあれば遷移
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
    }
  }

  const getNotificationIcon = (category: NotificationCategory) => {
    switch (category) {
      case "system":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )
      case "announcement":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        )
      case "reminder":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "alert":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      case "message":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        )
    }
  }

  const getCategoryBadgeColor = (category: NotificationCategory) => {
    switch (category) {
      case "system":
        return "bg-gray-100 text-gray-700"
      case "announcement":
        return "bg-blue-100 text-blue-700"
      case "reminder":
        return "bg-yellow-100 text-yellow-700"
      case "alert":
        return "bg-red-100 text-red-700"
      case "message":
        return "bg-green-100 text-green-700"
      default:
        return "bg-purple-100 text-purple-700"
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "personal":
        return <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-600">個人</span>
      case "organization":
        return <span className="text-xs px-2 py-0.5 rounded bg-green-50 text-green-600">事業所</span>
      case "global":
        return <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-600">全体</span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-600">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>読み込み中...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">通知</h1>
            <p className="text-gray-600 mt-1">
              {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : "未読通知はありません"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              すべて既読にする
            </button>
          )}
        </div>

        {/* タブ */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "all"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "unread"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              未読 {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setActiveTab("read")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "read"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              既読
            </button>
          </nav>
        </div>

        {/* カテゴリフィルター */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            カテゴリで絞り込み
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as NotificationCategory | "")}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">すべてのカテゴリ</option>
            <option value="system">システム</option>
            <option value="announcement">お知らせ</option>
            <option value="reminder">リマインダー</option>
            <option value="alert">アラート</option>
            <option value="message">メッセージ</option>
            <option value="update">更新通知</option>
          </select>
        </div>

        {/* 通知一覧 */}
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className="mt-4 text-gray-600">通知はありません</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? "border-l-4 border-blue-500" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-full p-2 ${!notification.isRead ? "bg-blue-100" : "bg-gray-100"}`}>
                    <div className={!notification.isRead ? "text-blue-600" : "text-gray-600"}>
                      {getNotificationIcon(notification.category)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeBadge(notification.type)}
                      <span className={`text-xs px-2 py-0.5 rounded ${getCategoryBadgeColor(notification.category)}`}>
                        {notification.category}
                      </span>
                      {notification.priority === "high" && (
                        <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                          重要
                        </span>
                      )}
                    </div>
                    <h3 className={`font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.createdAt.toDate().toLocaleString("ja-JP")}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
