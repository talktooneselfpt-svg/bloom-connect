'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getActiveStaff } from '@/lib/firestore/staff'
import { createInvitation, getInvitationsByOrganization } from '@/lib/firestore/device-invitations'
import type { Staff } from '@/types/staff'
import type { DeviceInvitation } from '@/types/device-invitation'
import { DEVICE_TYPE_LABELS } from '@/types/device'
import { INVITATION_STATUS_LABELS, INVITATION_STATUS_COLORS } from '@/types/device-invitation'

export default function DeviceInvitePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [invitations, setInvitations] = useState<DeviceInvitation[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    targetStaffId: '',
    deviceName: '',
    deviceType: 'tablet' as 'tablet' | 'smartphone' | 'pc' | 'other',
    expiresInDays: 7,
  })
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)

  // TODO: 実際のログイン組織ID・ユーザーIDを取得
  const organizationId = 'test-org-001'
  const currentUserId = 'test-user-001'
  const currentUserName = 'テスト管理者'

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [staffData, invitationsData] = await Promise.all([
        getActiveStaff(organizationId),
        getInvitationsByOrganization(organizationId),
      ])
      setStaff(staffData)
      setInvitations(invitationsData)
    } catch (error) {
      console.error('データの取得に失敗しました:', error)
      alert('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.targetStaffId || !formData.deviceName) {
      alert('すべての必須項目を入力してください')
      return
    }

    const selectedStaff = staff.find((s) => s.uid === formData.targetStaffId)
    if (!selectedStaff) {
      alert('職員が見つかりません')
      return
    }

    try {
      setCreating(true)
      const invitation = await createInvitation(
        organizationId,
        {
          targetStaffId: formData.targetStaffId,
          targetStaffName: selectedStaff.nameKanji,
          deviceName: formData.deviceName.trim(),
          deviceType: formData.deviceType,
          expiresInDays: formData.expiresInDays,
        },
        currentUserId,
        currentUserName
      )

      setGeneratedCode(invitation.invitationCode)
      await loadData()
    } catch (error) {
      console.error('招待コードの生成に失敗しました:', error)
      alert('招待コードの生成に失敗しました')
    } finally {
      setCreating(false)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setGeneratedCode(null)
    setFormData({
      targetStaffId: '',
      deviceName: '',
      deviceType: 'tablet',
      expiresInDays: 7,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <Link href="/devices" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
              ← デバイス一覧に戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">デバイス招待コード管理</h1>
            <p className="text-gray-600 mt-2">職員にデバイス登録用の招待コードを発行します</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            招待コードを生成
          </button>
        </div>

        {/* 招待コード一覧 */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">招待コード</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">職員名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">デバイス名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">タイプ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ステータス</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有効期限</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">作成日</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invitations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    招待コードがありません
                  </td>
                </tr>
              ) : (
                invitations.map((invitation) => (
                  <tr key={invitation.id}>
                    <td className="px-6 py-4">
                      <span className="text-2xl font-mono font-bold text-blue-600">
                        {invitation.invitationCode}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{invitation.targetStaffName}</td>
                    <td className="px-6 py-4 text-gray-900">{invitation.deviceName}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {DEVICE_TYPE_LABELS[invitation.deviceType]}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          INVITATION_STATUS_COLORS[invitation.status].bg
                        } ${INVITATION_STATUS_COLORS[invitation.status].text}`}
                      >
                        {INVITATION_STATUS_LABELS[invitation.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {invitation.expiresAt.toDate().toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {invitation.createdAt.toDate().toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 招待コード生成モーダル */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {generatedCode ? (
                /* 生成完了画面 */
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">招待コードを生成しました</h2>
                    <p className="text-gray-600 mb-6">以下のコードを職員に伝えてください</p>
                  </div>
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                    <div className="text-5xl font-mono font-bold text-blue-600 tracking-widest">
                      {generatedCode}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-6">
                    このコードは7日間有効です。職員はデバイス登録画面でこのコードを入力することでデバイスを登録できます。
                  </p>
                  <button
                    onClick={handleCloseModal}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    閉じる
                  </button>
                </div>
              ) : (
                /* フォーム画面 */
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">招待コードを生成</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="targetStaffId" className="block text-sm font-medium text-gray-700 mb-1">
                        招待する職員 <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="targetStaffId"
                        name="targetStaffId"
                        value={formData.targetStaffId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      >
                        <option value="">選択してください</option>
                        {staff.map((s) => (
                          <option key={s.uid} value={s.uid}>
                            {s.nameKanji} ({s.staffNumber})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700 mb-1">
                        デバイス名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="deviceName"
                        name="deviceName"
                        value={formData.deviceName}
                        onChange={handleChange}
                        required
                        placeholder="例: 田中のiPad"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="deviceType" className="block text-sm font-medium text-gray-700 mb-1">
                        デバイスタイプ
                      </label>
                      <select
                        id="deviceType"
                        name="deviceType"
                        value={formData.deviceType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      >
                        {Object.entries(DEVICE_TYPE_LABELS).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="expiresInDays" className="block text-sm font-medium text-gray-700 mb-1">
                        有効日数
                      </label>
                      <select
                        id="expiresInDays"
                        name="expiresInDays"
                        value={formData.expiresInDays}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      >
                        <option value={1}>1日</option>
                        <option value={3}>3日</option>
                        <option value={7}>7日（推奨）</option>
                        <option value={14}>14日</option>
                        <option value={30}>30日</option>
                      </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        キャンセル
                      </button>
                      <button
                        type="submit"
                        disabled={creating}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                      >
                        {creating ? '生成中...' : '生成'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
