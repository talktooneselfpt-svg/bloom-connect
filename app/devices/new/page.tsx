'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createDevice } from '@/lib/firestore/devices'
import { getStaffByOrganization } from '@/lib/firestore/staff'
import { DEVICE_TYPE_LABELS } from '@/types/device'
import { Staff } from '@/types/staff'

export default function NewDevicePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [staff, setStaff] = useState<Staff[]>([])
  const [formData, setFormData] = useState({
    deviceName: '',
    deviceType: 'tablet' as 'tablet' | 'smartphone' | 'pc' | 'other',
    assignedStaffIds: [] as string[],
    description: '',
    serialNumber: '',
  })

  // TODO: 実際のログイン組織ID・ユーザーIDを取得
  const organizationId = 'test-org-001'
  const currentUserId = 'test-user-001'

  useEffect(() => {
    loadStaff()
  }, [])

  const loadStaff = async () => {
    try {
      // 有効な職員のみ取得
      const staffData = await getStaffByOrganization(organizationId, true)
      setStaff(staffData)
    } catch (error) {
      console.error('職員の取得に失敗しました:', error)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStaffToggle = (staffId: string) => {
    setFormData((prev) => {
      const currentStaffIds = prev.assignedStaffIds
      if (currentStaffIds.includes(staffId)) {
        // 削除
        return {
          ...prev,
          assignedStaffIds: currentStaffIds.filter((id) => id !== staffId),
        }
      } else {
        // 追加（最大3名まで）
        if (currentStaffIds.length >= 3) {
          alert('デバイスに割り当てられる職員は最大3名までです')
          return prev
        }
        return {
          ...prev,
          assignedStaffIds: [...currentStaffIds, staffId],
        }
      }
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.deviceName.trim()) {
      alert('デバイス名を入力してください')
      return
    }

    try {
      setLoading(true)

      await createDevice(
        organizationId,
        {
          deviceName: formData.deviceName.trim(),
          deviceType: formData.deviceType,
          assignedStaffIds: formData.assignedStaffIds,
          description: formData.description.trim() || undefined,
          serialNumber: formData.serialNumber.trim() || undefined,
        },
        currentUserId
      )

      alert('デバイスを追加しました')
      router.push('/devices')
    } catch (error) {
      console.error('デバイスの追加に失敗しました:', error)
      alert('デバイスの追加に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/devices" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← デバイス一覧に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">デバイスを追加</h1>
          <p className="text-gray-600 mt-2">新しいデバイスを登録します</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* デバイス名 */}
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
              placeholder="例: 事務所iPad、訪問車1号など"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <p className="text-xs text-gray-500 mt-1">デバイスを識別しやすい名前を付けてください</p>
          </div>

          {/* デバイスタイプ */}
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

          {/* 職員の割り当て */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              職員の割り当て（最大3名）
            </label>
            <div className="border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {staff.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  割り当て可能な職員がいません
                </p>
              ) : (
                <div className="space-y-2">
                  {staff.map((s) => (
                    <label
                      key={s.uid}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.assignedStaffIds.includes(s.uid)
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedStaffIds.includes(s.uid)}
                        onChange={() => handleStaffToggle(s.uid)}
                        disabled={
                          !formData.assignedStaffIds.includes(s.uid) &&
                          formData.assignedStaffIds.length >= 3
                        }
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="font-medium text-gray-900">
                          {s.nameKanji} ({s.staffNumber})
                        </div>
                        <div className="text-sm text-gray-600">
                          {s.jobType} · {s.position}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              選択中: {formData.assignedStaffIds.length} / 3名
            </p>
          </div>

          {/* シリアル番号 */}
          <div>
            <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 mb-1">
              シリアル番号（任意）
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="例: ABC123456789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* 備考 */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              備考（任意）
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="デバイスに関する補足情報があれば入力してください"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          {/* 送信ボタン */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.push('/devices')}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '追加中...' : '追加'}
            </button>
          </div>
        </form>

        {/* 料金情報 */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 料金について</h3>
          <p className="text-sm text-blue-800">
            デバイス1台あたり月額1,000円（税抜）がかかります。1台につき最大3名まで職員を割り当てることができます。
          </p>
        </div>
      </div>
    </div>
  )
}
