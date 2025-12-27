'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type {
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  CreateNotificationInput,
} from '@/types/notification'
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_CATEGORY_LABELS,
  NOTIFICATION_PRIORITY_LABELS,
} from '@/types/notification'
import { createNotification } from '@/lib/firestore/notifications'
import { getStaffByOrganization } from '@/lib/firestore/staff'
import { Staff, ROLES } from '@/types/staff'

export default function CreateNotificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [staffList, setStaffList] = useState<Staff[]>([])

  // TODO: 実際のユーザー情報を取得
  const currentUserId = 'test-user-001'
  const currentUserName = '管理者'
  const currentOrganizationId = 'test-org-001'

  // フォーム状態
  const [formData, setFormData] = useState<{
    type: NotificationType
    category: NotificationCategory
    priority: NotificationPriority
    title: string
    message: string
    link?: string
    linkText?: string
    targetType: 'all' | 'role' | 'individual'
    targetRoles: string[]
    targetUserIds: string[]
    expiresInDays?: number
  }>({
    type: 'organization',
    category: 'announcement',
    priority: 'normal',
    title: '',
    message: '',
    link: '',
    linkText: '',
    targetType: 'all',
    targetRoles: [],
    targetUserIds: [],
    expiresInDays: undefined,
  })

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      // TODO: 実際の組織IDで取得
      const data = await getStaffByOrganization(currentOrganizationId)
      setStaffList(data)
    } catch (error) {
      console.error('職員一覧の取得に失敗しました:', error)
    }
  }

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleRoleToggle = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role],
    }))
  }

  const handleUserToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      targetUserIds: prev.targetUserIds.includes(userId)
        ? prev.targetUserIds.filter((id) => id !== userId)
        : [...prev.targetUserIds, userId],
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    if (!formData.message.trim()) {
      alert('メッセージを入力してください')
      return
    }

    if (formData.targetType === 'role' && formData.targetRoles.length === 0) {
      alert('対象の役割を選択してください')
      return
    }

    if (formData.targetType === 'individual' && formData.targetUserIds.length === 0) {
      alert('対象の職員を選択してください')
      return
    }

    try {
      setLoading(true)

      const input: CreateNotificationInput = {
        type: formData.type,
        category: formData.category,
        priority: formData.priority,
        title: formData.title.trim(),
        message: formData.message.trim(),
        link: formData.link?.trim() || undefined,
        linkText: formData.linkText?.trim() || undefined,
        organizationId: formData.type === 'organization' ? currentOrganizationId : undefined,
        senderName: currentUserName,
        targetUserIds:
          formData.targetType === 'individual' ? formData.targetUserIds : undefined,
        targetRoles: formData.targetType === 'role' ? formData.targetRoles : undefined,
        expiresAt: formData.expiresInDays
          ? (() => {
              const date = new Date()
              date.setDate(date.getDate() + formData.expiresInDays)
              return date
            })()
          : undefined,
      }

      await createNotification(input, currentUserId)

      alert('通知を送信しました')
      router.push('/notifications')
    } catch (error) {
      console.error('通知の作成に失敗しました:', error)
      alert('通知の作成に失敗しました')
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold text-gray-900">通知を作成</h1>
          <p className="text-gray-600 mt-2">職員に通知を送信します</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>

            {/* タイプ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">種類</label>
              <div className="flex gap-4">
                {(Object.keys(NOTIFICATION_TYPE_LABELS) as NotificationType[]).map((type) => (
                  <label key={type} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={(e) => handleChange('type', e.target.value as NotificationType)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-gray-900">
                      {NOTIFICATION_TYPE_LABELS[type]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* カテゴリー */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリー</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value as NotificationCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(NOTIFICATION_CATEGORY_LABELS) as NotificationCategory[]).map(
                  (category) => (
                    <option key={category} value={category}>
                      {NOTIFICATION_CATEGORY_LABELS[category]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* 優先度 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">優先度</label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as NotificationPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(Object.keys(NOTIFICATION_PRIORITY_LABELS) as NotificationPriority[]).map(
                  (priority) => (
                    <option key={priority} value={priority}>
                      {NOTIFICATION_PRIORITY_LABELS[priority]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* タイトル */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="通知のタイトルを入力"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* メッセージ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                メッセージ <span className="text-red-600">*</span>
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="通知の内容を入力"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* リンク（オプション） */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                リンク（オプション）
              </label>
              <input
                type="text"
                value={formData.link}
                onChange={(e) => handleChange('link', e.target.value)}
                placeholder="/staff, /clients など"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* リンクテキスト（オプション） */}
            {formData.link && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  リンクテキスト（オプション）
                </label>
                <input
                  type="text"
                  value={formData.linkText}
                  onChange={(e) => handleChange('linkText', e.target.value)}
                  placeholder="詳細を見る、確認する など"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* 有効期限（オプション） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                有効期限（オプション）
              </label>
              <select
                value={formData.expiresInDays || ''}
                onChange={(e) =>
                  handleChange('expiresInDays', e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">期限なし</option>
                <option value="7">7日後</option>
                <option value="14">14日後</option>
                <option value="30">30日後</option>
                <option value="60">60日後</option>
                <option value="90">90日後</option>
              </select>
            </div>
          </div>

          {/* 送信先 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">送信先</h2>

            {/* 送信先タイプ */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">送信先</label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={formData.targetType === 'all'}
                    onChange={(e) => handleChange('targetType', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900">全員</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="role"
                    checked={formData.targetType === 'role'}
                    onChange={(e) => handleChange('targetType', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900">役割で選択</span>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="individual"
                    checked={formData.targetType === 'individual'}
                    onChange={(e) => handleChange('targetType', e.target.value)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-900">個別に選択</span>
                </label>
              </div>
            </div>

            {/* 役割選択 */}
            {formData.targetType === 'role' && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象の役割を選択
                </label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetRoles.includes(role)}
                        onChange={() => handleRoleToggle(role)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-900">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 個別選択 */}
            {formData.targetType === 'individual' && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象の職員を選択（{formData.targetUserIds.length}名選択中）
                </label>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {staffList.map((staff) => (
                    <label key={staff.id} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.targetUserIds.includes(staff.id)}
                        onChange={() => handleUserToggle(staff.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-gray-900">
                        {staff.nameKanji} ({staff.role})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 送信ボタン */}
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
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '送信中...' : '通知を送信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
