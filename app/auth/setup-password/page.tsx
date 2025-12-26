'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, updateDoc } from 'firebase/firestore'

export default function SetupPasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    // ログインしているか確認
    if (!auth.currentUser) {
      router.push('/auth/login')
    }
  }, [router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError('すべての項目を入力してください')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('パスワードが一致しません')
      return
    }

    setIsSubmitting(true)

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('ログインしていません')
      }

      // Firebase Auth のパスワードを更新
      await updatePassword(user, passwordData.newPassword)

      // Firestore の職員データを更新（passwordSetupCompleted を true に設定）
      const staffRef = doc(db, 'staff', user.uid)
      await updateDoc(staffRef, {
        passwordSetupCompleted: true,
        updatedAt: new Date().toISOString(),
        updatedBy: user.uid,
      })

      // ダッシュボードにリダイレクト
      router.push('/')
    } catch (err: any) {
      console.error('パスワード設定エラー:', err)

      if (err.code === 'auth/weak-password') {
        setError('パスワードが弱すぎます')
      } else if (err.code === 'auth/requires-recent-login') {
        setError('セキュリティのため、再度ログインしてください')
      } else {
        setError('パスワードの設定中にエラーが発生しました: ' + err.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            パスワード設定
          </h1>
          <p className="text-gray-600">
            初回ログインです。新しいパスワードを設定してください
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, newPassword: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="8文字以上"
              required
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">
              8文字以上で設定してください
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード（確認） <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="パスワードを再入力"
              required
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">
              パスワードのポイント
            </h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 8文字以上で設定してください</li>
              <li>• 英字と数字を組み合わせることを推奨します</li>
              <li>• 他のサービスと同じパスワードは避けてください</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '設定中...' : 'パスワードを設定'}
          </button>
        </form>
      </div>
    </div>
  )
}
