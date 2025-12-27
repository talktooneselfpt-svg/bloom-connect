'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  // 通知設定
  const [notificationSettings, setNotificationSettings] = useState({
    enableOrganizationNotifications: true,
    enableSystemNotifications: true,
    enableAnnouncements: true,
    enableUpdates: true,
    enableMaintenance: true,
    enableAlerts: true,
    enableInfo: true,
    enableReminders: true,
    enablePushNotifications: false,
    enableEmailNotifications: false,
  })

  // 表示設定
  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light' as 'light' | 'dark' | 'auto',
    compactMode: false,
    showAvatars: true,
  })

  // TODO: 実際のログインユーザーIDを取得
  const currentUserId = 'test-user-001'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      // TODO: Firestoreから設定を取得
      // 仮でlocalStorageから取得
      const savedNotificationSettings = localStorage.getItem('notificationSettings')
      if (savedNotificationSettings) {
        setNotificationSettings(JSON.parse(savedNotificationSettings))
      }

      const savedDisplaySettings = localStorage.getItem('displaySettings')
      if (savedDisplaySettings) {
        setDisplaySettings(JSON.parse(savedDisplaySettings))
      }
    } catch (error) {
      console.error('設定の取得に失敗しました:', error)
    }
  }

  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleDisplayChange = (key: keyof typeof displaySettings, value: any) => {
    setDisplaySettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      // TODO: Firestoreに保存
      // 仮でlocalStorageに保存
      localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
      localStorage.setItem('displaySettings', JSON.stringify(displaySettings))

      alert('設定を保存しました')
    } catch (error) {
      console.error('設定の保存に失敗しました:', error)
      alert('設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/profile" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← プロフィールに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">アカウント設定</h1>
          <p className="text-gray-600 mt-2">通知や表示に関する設定を変更できます</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 通知設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">通知設定</h2>

            {/* 通知タイプ */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">通知タイプ</h3>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">事業所からの通知</div>
                  <div className="text-sm text-gray-600">事業所の管理者からの通知を受け取ります</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableOrganizationNotifications}
                  onChange={() => handleNotificationToggle('enableOrganizationNotifications')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">運営からの通知</div>
                  <div className="text-sm text-gray-600">システムアップデートやメンテナンス情報を受け取ります</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableSystemNotifications}
                  onChange={() => handleNotificationToggle('enableSystemNotifications')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            {/* 通知カテゴリー */}
            <div className="space-y-3 mb-6 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">通知カテゴリー</h3>
              {[
                { key: 'enableAnnouncements' as const, label: 'お知らせ', desc: '一般的なお知らせを受け取ります' },
                { key: 'enableUpdates' as const, label: 'アップデート情報', desc: '新機能やシステム更新の情報を受け取ります' },
                { key: 'enableMaintenance' as const, label: 'メンテナンス情報', desc: 'メンテナンス予定を受け取ります' },
                { key: 'enableAlerts' as const, label: '重要な警告', desc: 'セキュリティや緊急の警告を受け取ります' },
                { key: 'enableInfo' as const, label: '一般情報', desc: '一般的な情報を受け取ります' },
                { key: 'enableReminders' as const, label: 'リマインダー', desc: '期限や予定のリマインダーを受け取ります' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{item.label}</div>
                    <div className="text-xs text-gray-600">{item.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings[item.key]}
                    onChange={() => handleNotificationToggle(item.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>

            {/* 通知方法 */}
            <div className="space-y-3 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">通知方法</h3>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">プッシュ通知</div>
                  <div className="text-sm text-gray-600">ブラウザでプッシュ通知を受け取ります（準備中）</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.enablePushNotifications}
                  onChange={() => handleNotificationToggle('enablePushNotifications')}
                  disabled
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">メール通知</div>
                  <div className="text-sm text-gray-600">登録メールアドレスに通知を送信します（準備中）</div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationSettings.enableEmailNotifications}
                  onChange={() => handleNotificationToggle('enableEmailNotifications')}
                  disabled
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          {/* 表示設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">表示設定</h2>

            {/* テーマ */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">カラーテーマ</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'ライト', icon: '☀️' },
                  { value: 'dark', label: 'ダーク', icon: '🌙' },
                  { value: 'auto', label: '自動', icon: '🔄' },
                ].map((theme) => (
                  <button
                    key={theme.value}
                    type="button"
                    onClick={() => handleDisplayChange('theme', theme.value)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      displaySettings.theme === theme.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{theme.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{theme.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                ダークテーマは現在準備中です。自動は端末の設定に従います。
              </p>
            </div>

            {/* その他の表示オプション */}
            <div className="space-y-3 border-t pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">その他の表示オプション</h3>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">コンパクトモード</div>
                  <div className="text-sm text-gray-600">行間を詰めて一画面に多くの情報を表示します</div>
                </div>
                <input
                  type="checkbox"
                  checked={displaySettings.compactMode}
                  onChange={() => handleDisplayChange('compactMode', !displaySettings.compactMode)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">アバター画像を表示</div>
                  <div className="text-sm text-gray-600">一覧でプロフィール画像を表示します</div>
                </div>
                <input
                  type="checkbox"
                  checked={displaySettings.showAvatars}
                  onChange={() => handleDisplayChange('showAvatars', !displaySettings.showAvatars)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
