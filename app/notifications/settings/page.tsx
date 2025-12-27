'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { NotificationSettings } from '@/types/notification'
import { getNotificationSettings, updateNotificationSettings } from '@/lib/firestore/notifications'

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<Partial<NotificationSettings>>({
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

  // TODO: 実際のログインユーザーIDを取得
  const currentUserId = 'test-user-001'

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const userSettings = await getNotificationSettings(currentUserId)
      if (userSettings) {
        setSettings(userSettings)
      }
    } catch (error) {
      console.error('設定の取得に失敗しました:', error)
    }
  }

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)
      await updateNotificationSettings(currentUserId, settings)
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
      <div className="max-w-3xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/notifications" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← 通知一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">通知設定</h1>
          <p className="text-gray-600 mt-2">受け取る通知の種類をカスタマイズできます</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 通知タイプ */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">通知タイプ</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">事業所からの通知</div>
                  <div className="text-sm text-gray-600">
                    事業所の管理者からの通知を受け取ります
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableOrganizationNotifications}
                  onChange={() => handleToggle('enableOrganizationNotifications')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">運営からの通知</div>
                  <div className="text-sm text-gray-600">
                    システムアップデートやメンテナンス情報を受け取ります
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableSystemNotifications}
                  onChange={() => handleToggle('enableSystemNotifications')}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* 通知カテゴリー */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">通知カテゴリー</h2>
            <p className="text-sm text-gray-600 mb-4">
              受け取りたい通知のカテゴリーを選択してください
            </p>
            <div className="space-y-3">
              {[
                {
                  key: 'enableAnnouncements' as const,
                  label: 'お知らせ',
                  desc: '一般的なお知らせを受け取ります',
                },
                {
                  key: 'enableUpdates' as const,
                  label: 'アップデート情報',
                  desc: '新機能やシステム更新の情報を受け取ります',
                },
                {
                  key: 'enableMaintenance' as const,
                  label: 'メンテナンス情報',
                  desc: 'メンテナンス予定を受け取ります',
                },
                {
                  key: 'enableAlerts' as const,
                  label: '重要な警告',
                  desc: 'セキュリティや緊急の警告を受け取ります（推奨）',
                },
                {
                  key: 'enableInfo' as const,
                  label: '一般情報',
                  desc: '一般的な情報を受け取ります',
                },
                {
                  key: 'enableReminders' as const,
                  label: 'リマインダー',
                  desc: '期限や予定のリマインダーを受け取ります',
                },
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
                    checked={settings[item.key] as boolean}
                    onChange={() => handleToggle(item.key)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* 通知方法 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">通知方法</h2>
            <p className="text-sm text-gray-600 mb-4">
              通知の配信方法を選択してください
            </p>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">プッシュ通知</div>
                  <div className="text-sm text-gray-600">
                    ブラウザでプッシュ通知を受け取ります（準備中）
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enablePushNotifications}
                  onChange={() => handleToggle('enablePushNotifications')}
                  disabled
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <div className="font-medium text-gray-900">メール通知</div>
                  <div className="text-sm text-gray-600">
                    登録メールアドレスに通知を送信します（準備中）
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableEmailNotifications}
                  onChange={() => handleToggle('enableEmailNotifications')}
                  disabled
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                />
              </label>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 ヒント: 重要な警告（enableAlerts）は常にONにしておくことを推奨します。
              </p>
            </div>
          </div>

          {/* クイック設定 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">クイック設定</h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSettings({
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
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
              >
                すべてON
              </button>

              <button
                type="button"
                onClick={() => {
                  setSettings({
                    enableOrganizationNotifications: false,
                    enableSystemNotifications: false,
                    enableAnnouncements: false,
                    enableUpdates: false,
                    enableMaintenance: false,
                    enableAlerts: true, // 重要な警告だけは残す
                    enableInfo: false,
                    enableReminders: false,
                    enablePushNotifications: false,
                    enableEmailNotifications: false,
                  })
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"
              >
                最小限
              </button>

              <button
                type="button"
                onClick={loadSettings}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                リセット
              </button>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/notifications')}
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
