"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { db } from "@/lib/firebase"
import { collection, query, where, getCountFromServer } from "firebase/firestore"
import { Notification, SAMPLE_NOTIFICATIONS, getPriorityColor } from "@/types/notification"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    staffCount: 0,
    clientCount: 0,
    organizationCount: 0,
    activeStaffCount: 0,
    activeClientCount: 0,
    activeOrganizationCount: 0
  })

  // 親機/子機モードの状態管理
  const [deviceMode, setDeviceMode] = useState<'parent' | 'child'>('child')
  const [userRole, setUserRole] = useState<string>('') // ユーザーの権限ロール

  // 通知の状態管理
  const [notifications, setNotifications] = useState<Partial<Notification>[]>([])
  const [showAllNotifications, setShowAllNotifications] = useState(false)

  useEffect(() => {
    loadDashboardData()
    loadNotifications()
    // TODO: 実際のログインユーザーの権限を取得
    // 仮で管理者権限を設定（実装時は実際の認証情報から取得）
    setUserRole('管理者')

    // localStorageから前回のモード設定を復元
    const savedMode = localStorage.getItem('deviceMode') as 'parent' | 'child'
    if (savedMode) {
      setDeviceMode(savedMode)
    }
  }, [])

  const loadNotifications = async () => {
    // TODO: Firestoreから通知を取得
    // 仮でサンプルデータを使用
    setNotifications(SAMPLE_NOTIFICATIONS)
  }

  const handleMarkAsRead = (notificationId: string) => {
    // TODO: Firestoreで既読状態を更新
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    )
  }

  const handleMarkAllAsRead = (type: 'organization' | 'system') => {
    // TODO: Firestoreで既読状態を更新
    setNotifications(prev =>
      prev.map(notif =>
        notif.type === type ? { ...notif, isRead: true } : notif
      )
    )
  }

  // 通知を種類別に分類
  const organizationNotifications = notifications.filter(n => n.type === 'organization')
  const systemNotifications = notifications.filter(n => n.type === 'system')

  // 未読数を計算
  const unreadOrganizationCount = organizationNotifications.filter(n => !n.isRead).length
  const unreadSystemCount = systemNotifications.filter(n => !n.isRead).length

  const isAdminOrManager = userRole === '管理者' || userRole === 'マネージャー'

  const handleModeToggle = () => {
    if (!isAdminOrManager) return // 管理者・マネージャー以外は切り替え不可

    const newMode = deviceMode === 'parent' ? 'child' : 'parent'
    setDeviceMode(newMode)
    localStorage.setItem('deviceMode', newMode)
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // カウントのみを取得（全データを読み込まないため高速）
      const [
        staffCount,
        activeStaffCount,
        clientCount,
        activeClientCount,
        orgCount,
        activeOrgCount
      ] = await Promise.all([
        getCountFromServer(collection(db, 'staff')),
        getCountFromServer(query(collection(db, 'staff'), where('isActive', '==', true))),
        getCountFromServer(collection(db, 'clients')),
        getCountFromServer(query(collection(db, 'clients'), where('isActive', '==', true))),
        getCountFromServer(collection(db, 'organizations')),
        getCountFromServer(query(collection(db, 'organizations'), where('isActive', '==', true)))
      ])

      setStats({
        staffCount: staffCount.data().count,
        clientCount: clientCount.data().count,
        organizationCount: orgCount.data().count,
        activeStaffCount: activeStaffCount.data().count,
        activeClientCount: activeClientCount.data().count,
        activeOrganizationCount: activeOrgCount.data().count
      })
    } catch (err) {
      console.error("データの取得に失敗しました:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* スケルトンローディング */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダーとトグルスイッチ */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">ダッシュボード</h2>
            <p className="text-gray-600">システムの概要と主要機能へのアクセス</p>
          </div>

          {/* 親機/子機トグルスイッチ */}
          <div className="flex items-center gap-3 bg-white rounded-lg shadow-md px-4 py-3">
            <span className={`text-sm font-medium ${deviceMode === 'child' ? 'text-gray-900' : 'text-gray-400'}`}>
              子機
            </span>
            <button
              onClick={handleModeToggle}
              disabled={!isAdminOrManager}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                deviceMode === 'parent' ? 'bg-blue-600' : 'bg-gray-300'
              } ${!isAdminOrManager ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              title={!isAdminOrManager ? '管理者権限が必要です' : ''}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  deviceMode === 'parent' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${deviceMode === 'parent' ? 'text-gray-900' : 'text-gray-400'}`}>
              親機
            </span>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* スタッフ統計 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">スタッフ</h3>
              <div className="bg-blue-100 rounded-full p-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.staffCount}</p>
              <p className="text-sm text-gray-600">総登録数</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">有効: {stats.activeStaffCount}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">無効: {stats.staffCount - stats.activeStaffCount}</span>
            </div>
            <button
              onClick={() => router.push("/staff")}
              className="mt-4 w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium"
            >
              スタッフ一覧を見る
            </button>
          </div>

          {/* 利用者統計 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">利用者</h3>
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.clientCount}</p>
              <p className="text-sm text-gray-600">総登録数</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">有効: {stats.activeClientCount}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">無効: {stats.clientCount - stats.activeClientCount}</span>
            </div>
            <button
              onClick={() => router.push("/clients")}
              className="mt-4 w-full bg-green-50 text-green-700 px-4 py-2 rounded-md hover:bg-green-100 transition-colors text-sm font-medium"
            >
              利用者一覧を見る
            </button>
          </div>

          {/* 事業所統計 */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">事業所</h3>
              <div className="bg-purple-100 rounded-full p-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
            <div className="mb-2">
              <p className="text-3xl font-bold text-gray-900">{stats.organizationCount}</p>
              <p className="text-sm text-gray-600">総登録数</p>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">有効: {stats.activeOrganizationCount}</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">無効: {stats.organizationCount - stats.activeOrganizationCount}</span>
            </div>
            <button
              onClick={() => router.push("/organizations")}
              className="mt-4 w-full bg-purple-50 text-purple-700 px-4 py-2 rounded-md hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              事業所一覧を見る
            </button>
          </div>
        </div>

        {/* 通知セクション */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 事業所からの通知 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">事業所からの通知</h3>
                {unreadOrganizationCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {unreadOrganizationCount}
                  </span>
                )}
              </div>
              {unreadOrganizationCount > 0 && (
                <button
                  onClick={() => handleMarkAllAsRead('organization')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  すべて既読
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {organizationNotifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">通知はありません</p>
              ) : (
                organizationNotifications.slice(0, showAllNotifications ? undefined : 3).map((notif) => (
                  <div
                    key={notif.id}
                    className={`border rounded-lg p-4 transition-all ${
                      notif.isRead ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    } ${notif.isPinned ? 'border-l-4 border-l-yellow-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {notif.isPinned && (
                          <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1h-2zM11 5.06V5.06l-.546.219-1.29-.51L6.774 6.89a1 1 0 00-.494.892c0 .193.048.381.139.547l.817 1.546 2.54 1.52a1 1 0 001.516-.813l.095-.475-1.328-2.515a1 1 0 00-.896-.514H8v-1h1.172c.276 0 .527.112.707.293zM10 17a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{notif.title}</h4>
                          <p className="text-sm text-gray-700 mb-2">{notif.message}</p>
                          {notif.senderName && (
                            <p className="text-xs text-gray-500">送信者: {notif.senderName}</p>
                          )}
                        </div>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id!)}
                          className="text-blue-600 hover:text-blue-800 ml-2"
                          title="既読にする"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    {notif.link && (
                      <button
                        onClick={() => router.push(notif.link!)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {notif.linkText || '詳細を見る'} →
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {organizationNotifications.length > 3 && !showAllNotifications && (
              <button
                onClick={() => setShowAllNotifications(true)}
                className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                すべて表示 ({organizationNotifications.length}件)
              </button>
            )}
          </div>

          {/* 運営からの通知 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">運営からの通知</h3>
                {unreadSystemCount > 0 && (
                  <span className="bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {unreadSystemCount}
                  </span>
                )}
              </div>
              {unreadSystemCount > 0 && (
                <button
                  onClick={() => handleMarkAllAsRead('system')}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  すべて既読
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {systemNotifications.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">通知はありません</p>
              ) : (
                systemNotifications.slice(0, showAllNotifications ? undefined : 3).map((notif) => {
                  const priorityColor = getPriorityColor(notif.priority!)
                  const borderColor = {
                    red: 'border-red-200',
                    orange: 'border-orange-200',
                    blue: 'border-blue-200',
                    gray: 'border-gray-200'
                  }[priorityColor]

                  const bgColor = {
                    red: 'bg-red-50',
                    orange: 'bg-orange-50',
                    blue: 'bg-blue-50',
                    gray: 'bg-gray-50'
                  }[priorityColor]

                  return (
                    <div
                      key={notif.id}
                      className={`border rounded-lg p-4 transition-all ${
                        notif.isRead ? 'bg-gray-50 border-gray-200' : `${bgColor} ${borderColor}`
                      } ${notif.isPinned ? 'border-l-4 border-l-yellow-500' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          {notif.isPinned && (
                            <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L11 4.323V3a1 1 0 011-1h-2zM11 5.06V5.06l-.546.219-1.29-.51L6.774 6.89a1 1 0 00-.494.892c0 .193.048.381.139.547l.817 1.546 2.54 1.52a1 1 0 001.516-.813l.095-.475-1.328-2.515a1 1 0 00-.896-.514H8v-1h1.172c.276 0 .527.112.707.293zM10 17a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{notif.title}</h4>
                              {notif.priority === 'urgent' && (
                                <span className="bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                  重要
                                </span>
                              )}
                              {notif.priority === 'high' && (
                                <span className="bg-orange-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
                                  優先
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{notif.message}</p>
                          </div>
                        </div>
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id!)}
                            className="text-purple-600 hover:text-purple-800 ml-2"
                            title="既読にする"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                      {notif.link && (
                        <button
                          onClick={() => router.push(notif.link!)}
                          className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                        >
                          {notif.linkText || '詳細を見る'} →
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {systemNotifications.length > 3 && !showAllNotifications && (
              <button
                onClick={() => setShowAllNotifications(true)}
                className="w-full mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                すべて表示 ({systemNotifications.length}件)
              </button>
            )}
          </div>
        </div>

        {/* クイックアクション - 親機モードのみ表示 */}
        {deviceMode === 'parent' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">クイックアクション</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/staff/new")}
              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              スタッフを追加
            </button>
            <button
              onClick={() => router.push("/clients/new")}
              className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              利用者を追加
            </button>
            <button
              onClick={() => router.push("/organizations/new")}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              事業所を追加
            </button>
          </div>
        </div>
        )}

        {/* 主要機能へのアクセス */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">主要機能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push("/staff")}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
            >
              <div className="bg-blue-100 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">スタッフ管理</h4>
                <p className="text-sm text-gray-600">スタッフの登録・編集・検索</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/clients")}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
            >
              <div className="bg-green-100 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">利用者管理</h4>
                <p className="text-sm text-gray-600">利用者の登録・編集・情報管理</p>
              </div>
            </button>

            <button
              onClick={() => router.push("/organizations")}
              className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
            >
              <div className="bg-purple-100 rounded-lg p-2 mt-1">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">事業所管理</h4>
                <p className="text-sm text-gray-600">事業所の登録・編集・設定</p>
              </div>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
