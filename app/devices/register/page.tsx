'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getInvitationByCode, markInvitationAsUsed, validateInvitation } from '@/lib/firestore/device-invitations'
import { registerDeviceWithInvitation } from '@/lib/firestore/devices'
import type { DeviceInvitation } from '@/types/device-invitation'

/**
 * IPアドレスを取得（簡易版 - 外部APIを使用）
 */
async function getClientIP(): Promise<string | undefined> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.warn('IPアドレスの取得に失敗しました:', error)
    return undefined
  }
}

export default function DeviceRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<'input' | 'confirm' | 'complete'>('input')
  const [loading, setLoading] = useState(false)
  const [invitationCode, setInvitationCode] = useState('')
  const [invitation, setInvitation] = useState<DeviceInvitation | null>(null)
  const [registeredDeviceId, setRegisteredDeviceId] = useState<string | null>(null)

  const handleVerifyCode = async () => {
    if (!invitationCode.trim()) {
      alert('招待コードを入力してください')
      return
    }

    try {
      setLoading(true)
      const inv = await getInvitationByCode(invitationCode.trim())

      if (!inv) {
        alert('招待コードが見つかりません')
        return
      }

      const validation = validateInvitation(inv)
      if (!validation.isValid) {
        alert(validation.error || '招待コードが無効です')
        return
      }

      setInvitation(inv)
      setStep('confirm')
    } catch (error) {
      console.error('招待コードの確認に失敗しました:', error)
      alert('招待コードの確認に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!invitation) return

    try {
      setLoading(true)

      // IPアドレスを取得
      const clientIP = await getClientIP()

      // デバイスを登録
      const deviceId = await registerDeviceWithInvitation(
        invitation.organizationId,
        invitation.targetStaffId,
        invitation.deviceName,
        invitation.deviceType,
        clientIP
      )

      // 招待コードを使用済みに
      await markInvitationAsUsed(invitation.id, deviceId)

      setRegisteredDeviceId(deviceId)
      setStep('complete')
    } catch (error) {
      console.error('デバイスの登録に失敗しました:', error)
      alert('デバイスの登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {step === 'input' && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">デバイス登録</h1>
              <p className="text-gray-600">管理者から受け取った招待コードを入力してください</p>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="invitationCode" className="block text-sm font-medium text-gray-700 mb-2">
                  招待コード（6桁）
                </label>
                <input
                  type="text"
                  id="invitationCode"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 text-center text-2xl font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={loading || invitationCode.length !== 6}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '確認中...' : '次へ'}
              </button>

              <div className="text-center">
                <Link href="/devices" className="text-sm text-blue-600 hover:text-blue-800">
                  デバイス一覧に戻る
                </Link>
              </div>
            </div>
          </div>
        )}

        {step === 'confirm' && invitation && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">登録内容の確認</h1>
              <p className="text-gray-600">以下の内容で登録します</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">職員名</div>
                <div className="text-lg font-semibold text-gray-900">{invitation.targetStaffName}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">デバイス名</div>
                <div className="text-lg font-semibold text-gray-900">{invitation.deviceName}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">デバイスタイプ</div>
                <div className="text-lg font-semibold text-gray-900">
                  {invitation.deviceType === 'tablet'
                    ? 'タブレット'
                    : invitation.deviceType === 'smartphone'
                    ? 'スマートフォン'
                    : invitation.deviceType === 'pc'
                    ? 'PC'
                    : 'その他'}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-800">
                    登録を完了すると、このデバイスに固有のトークンが発行され、自動的にアカウントと紐付けられます。
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setStep('input')
                  setInvitation(null)
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                戻る
              </button>
              <button
                onClick={handleRegister}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '登録中...' : '登録'}
              </button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">登録完了</h1>
              <p className="text-gray-600 mb-8">デバイスの登録が完了しました</p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-green-800 mb-4">
                  このデバイスは自動的にアカウントと紐付けられました。デバイス固有のトークンがブラウザに保存されているため、次回以降は自動的に認識されます。
                </p>
                <div className="text-xs text-green-700">
                  デバイスID: <span className="font-mono">{registeredDeviceId}</span>
                </div>
              </div>

              <button
                onClick={() => router.push('/devices')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                デバイス一覧へ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
