'use client'

import { useState, useEffect, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAuth, updateEmail } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { getStaff, updateStaff } from '@/lib/firestore/staff'
import { Staff } from '@/types/staff'

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    nameKanji: '',
    nameKana: '',
    email: '',
    phonePersonal: '',
  })

  // TODO: 実際のログインユーザーIDを取得
  const currentUserId = 'test-user-001'

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const staffData = await getStaff(currentUserId)

      if (!staffData) {
        alert('プロフィール情報が見つかりませんでした')
        router.push('/')
        return
      }

      setStaff(staffData)
      setFormData({
        nameKanji: staffData.nameKanji,
        nameKana: staffData.nameKana,
        email: staffData.email || '',
        phonePersonal: staffData.phonePersonal || '',
      })

      // アバター画像がある場合は取得
      if (staffData.avatarUrl) {
        setAvatarUrl(staffData.avatarUrl)
      }
    } catch (error) {
      console.error('プロフィールの取得に失敗しました:', error)
      alert('プロフィールの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 画像ファイルのチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください')
      return
    }

    // ファイルサイズのチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      return
    }

    try {
      setUploadingImage(true)

      // Firebase Storageにアップロード
      const storageRef = ref(storage, `avatars/${currentUserId}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadUrl = await getDownloadURL(storageRef)

      setAvatarUrl(downloadUrl)

      // Firestoreのスタッフ情報を更新
      await updateStaff(currentUserId, { avatarUrl: downloadUrl }, currentUserId)

      alert('プロフィール画像を更新しました')
    } catch (error) {
      console.error('画像のアップロードに失敗しました:', error)
      alert('画像のアップロードに失敗しました')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!formData.nameKanji.trim()) {
      alert('氏名（漢字）を入力してください')
      return
    }

    try {
      setSaving(true)

      // メールアドレスが変更されている場合はFirebase Authを更新
      const auth = getAuth()
      const user = auth.currentUser
      if (user && formData.email !== staff?.email) {
        await updateEmail(user, formData.email)
      }

      // Firestoreのスタッフ情報を更新
      await updateStaff(
        currentUserId,
        {
          nameKanji: formData.nameKanji.trim(),
          nameKana: formData.nameKana.trim(),
          email: formData.email.trim() || undefined,
          phonePersonal: formData.phonePersonal.trim() || undefined,
        },
        currentUserId
      )

      alert('プロフィールを更新しました')
      loadProfile()
    } catch (error: any) {
      console.error('プロフィールの更新に失敗しました:', error)

      if (error.code === 'auth/requires-recent-login') {
        alert('セキュリティのため、メールアドレスを変更するには再ログインが必要です')
      } else if (error.code === 'auth/email-already-in-use') {
        alert('このメールアドレスは既に使用されています')
      } else {
        alert('プロフィールの更新に失敗しました')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div className="h-24 w-24 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!staff) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← ダッシュボードに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">プロフィール</h1>
          <p className="text-gray-600 mt-2">個人情報を確認・編集できます</p>
        </div>

        <div className="space-y-6">
          {/* アバター画像 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">プロフィール画像</h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="プロフィール画像"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
                    <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? 'アップロード中...' : '画像を変更'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  JPG、PNG形式、最大5MB
                </p>
              </div>
            </div>
          </div>

          {/* 基本情報 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">基本情報</h2>

            {/* 職員番号（読み取り専用） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                職員番号
              </label>
              <input
                type="text"
                value={staff.staffNumber}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* 氏名（漢字） */}
            <div>
              <label htmlFor="nameKanji" className="block text-sm font-medium text-gray-700 mb-1">
                氏名（漢字） <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nameKanji"
                name="nameKanji"
                value={formData.nameKanji}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* 氏名（カナ） */}
            <div>
              <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700 mb-1">
                氏名（カナ）
              </label>
              <input
                type="text"
                id="nameKana"
                name="nameKana"
                value={formData.nameKana}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
              <p className="text-xs text-gray-500 mt-1">
                メールアドレスを変更する場合、変更後に再ログインが必要です
              </p>
            </div>

            {/* 電話番号 */}
            <div>
              <label htmlFor="phonePersonal" className="block text-sm font-medium text-gray-700 mb-1">
                電話番号（個人用）
              </label>
              <input
                type="tel"
                id="phonePersonal"
                name="phonePersonal"
                value={formData.phonePersonal}
                onChange={handleChange}
                placeholder="090-1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            {/* 送信ボタン */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </form>

          {/* 職場情報（読み取り専用） */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">職場情報</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">職種:</span>
                <span className="ml-2 font-medium text-gray-900">{staff.jobType}</span>
              </div>
              <div>
                <span className="text-gray-600">役職:</span>
                <span className="ml-2 font-medium text-gray-900">{staff.position}</span>
              </div>
              <div>
                <span className="text-gray-600">権限:</span>
                <span className="ml-2 font-medium text-gray-900">{staff.role}</span>
              </div>
              <div>
                <span className="text-gray-600">ステータス:</span>
                <span className={`ml-2 font-medium ${staff.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                  {staff.isActive ? '有効' : '無効'}
                </span>
              </div>
            </div>
          </div>

          {/* その他の設定へのリンク */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">その他の設定</h2>
            <div className="space-y-3">
              <Link
                href="/settings"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">アカウント設定</div>
                    <div className="text-sm text-gray-600">通知設定、表示設定など</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/settings/security"
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <div className="font-medium text-gray-900">セキュリティ設定</div>
                    <div className="text-sm text-gray-600">パスワード変更</div>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
