'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { createOrganization } from '@/lib/firestore/organizations'
import { createStaff } from '@/lib/firestore/staff'
import { createTrialSubscription } from '@/lib/firestore/subscriptions'
import { createNotification } from '@/lib/firestore/notifications'
import { createUserSettings } from '@/lib/firestore/userSettings'
import { JOB_TYPES, POSITIONS } from '@/types/staff'
import { ORGANIZATION_TYPES, PREFECTURES } from '@/types/organization'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [setupComplete, setSetupComplete] = useState(false)

  // 事業所情報
  const [orgData, setOrgData] = useState({
    name: '',
    type: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    phoneNumber: '',
    email: '',
  })

  // 代表者情報
  const [adminData, setAdminData] = useState({
    nameKanji: '',
    nameKana: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phoneCompany: '',
    jobType: '',
    position: '代表',
  })

  const handleOrgSubmit = (e: FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!orgData.name || !orgData.type || !orgData.phoneNumber || !orgData.email) {
      setError('必須項目を入力してください')
      return
    }

    setError('')
    setStep(2)
  }

  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!adminData.nameKanji || !adminData.email || !adminData.password) {
      setError('必須項目を入力してください')
      return
    }

    if (adminData.password !== adminData.passwordConfirm) {
      setError('パスワードが一致しません')
      return
    }

    if (adminData.password.length < 8) {
      setError('パスワードは8文字以上で入力してください')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Firebase Authentication でユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(
        auth!,
        adminData.email,
        adminData.password
      )
      const uid = userCredential.user.uid

      // 2. 事業所を作成
      const organizationId = await createOrganization({
        organizationCode: '', // 自動生成される
        name: orgData.name,
        organizationType: orgData.type,
        postalCode: orgData.postalCode,
        prefecture: orgData.prefecture,
        city: orgData.city,
        addressLine: orgData.address,
        phone: orgData.phoneNumber,
        email: orgData.email,
        administratorName: adminData.nameKanji, // 代表者の名前を管理者名に設定
        isActive: true,
        createdBy: uid,
        updatedBy: uid,
      })

      // 3. 代表者（職員）を作成
      await createStaff(uid, {
        organizationId,
        uid,
        staffNumber: '', // 自動生成される
        nameKanji: adminData.nameKanji,
        nameKana: adminData.nameKana,
        jobTypes: [adminData.jobType], // 配列に変換
        position: adminData.position,
        role: '管理者',
        phoneCompany: adminData.phoneCompany,
        email: adminData.email,
        isActive: true,
        passwordSetupCompleted: true, // 代表者は初回セットアップ時にパスワードを設定済み
        createdBy: uid,
        updatedBy: uid,
      })

      // 4. トライアルサブスクリプションを作成
      await createTrialSubscription(organizationId, uid)

      // 5. デフォルトユーザー設定を作成
      await createUserSettings(uid)

      // 6. ウェルカム通知を送信
      await createNotification(
        uid,
        'ブルームコネクトへようこそ！',
        `${orgData.name}の初期セットアップが完了しました。30日間の無料トライアルをお楽しみください。`,
        'success'
      )

      // 7. セットアップ完了画面を表示
      setSetupComplete(true)
      setStep(3)
    } catch (err: any) {
      console.error('セットアップエラー:', err)

      if (err.code === 'auth/email-already-in-use') {
        setError('このメールアドレスは既に使用されています')
      } else if (err.code === 'auth/invalid-email') {
        setError('メールアドレスの形式が正しくありません')
      } else if (err.code === 'auth/weak-password') {
        setError('パスワードが弱すぎます')
      } else {
        setError('セットアップ中にエラーが発生しました: ' + err.message)
      }

      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ブルームコネクトへようこそ
          </h1>
          <p className="text-gray-600">
            初回セットアップ - 事業所と代表者を登録します
          </p>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 1 ? '1' : '✓'}
            </div>
            <div className={`w-24 h-1 mx-2 ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 2 ? 'bg-blue-600 text-white' : step > 2 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step > 2 ? '✓' : '2'}
            </div>
            <div className={`w-24 h-1 mx-2 ${step >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 3 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              {step === 3 ? '✓' : '3'}
            </div>
          </div>
        </div>

        {/* ステップ1: 事業所情報 */}
        {step === 1 && (
          <form onSubmit={handleOrgSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ステップ1: 事業所情報
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事業所名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事業所種別 <span className="text-red-500">*</span>
              </label>
              <select
                value={orgData.type}
                onChange={(e) => setOrgData({ ...orgData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">選択してください</option>
                {ORGANIZATION_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  郵便番号
                </label>
                <input
                  type="text"
                  value={orgData.postalCode}
                  onChange={(e) => setOrgData({ ...orgData, postalCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="000-0000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  都道府県
                </label>
                <select
                  value={orgData.prefecture}
                  onChange={(e) => setOrgData({ ...orgData, prefecture: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">選択してください</option>
                  {PREFECTURES.map((pref) => (
                    <option key={pref} value={pref}>
                      {pref}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                市区町村
              </label>
              <input
                type="text"
                value={orgData.city}
                onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={orgData.phoneNumber}
                onChange={(e) => setOrgData({ ...orgData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={orgData.email}
                onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              次へ
            </button>
          </form>
        )}

        {/* ステップ2: 代表者情報 */}
        {step === 2 && (
          <form onSubmit={handleAdminSubmit} className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                ステップ2: 代表者情報
              </h2>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← 戻る
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名（漢字） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminData.nameKanji}
                  onChange={(e) => setAdminData({ ...adminData, nameKanji: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名（ひらがな）
                </label>
                <input
                  type="text"
                  value={adminData.nameKana}
                  onChange={(e) => setAdminData({ ...adminData, nameKana: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス（ログイン用） <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={adminData.email}
                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（8文字以上） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={adminData.password}
                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                パスワード（確認） <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={adminData.passwordConfirm}
                onChange={(e) => setAdminData({ ...adminData, passwordConfirm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={adminData.phoneCompany}
                onChange={(e) => setAdminData({ ...adminData, phoneCompany: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                職種
              </label>
              <select
                value={adminData.jobType}
                onChange={(e) => setAdminData({ ...adminData, jobType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">選択してください</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '登録中...' : 'セットアップ完了'}
            </button>
          </form>
        )}

        {/* ステップ3: セットアップ完了 */}
        {step === 3 && setupComplete && (
          <div className="text-center space-y-6">
            {/* 成功アイコン */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* メッセージ */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                セットアップが完了しました！
              </h2>
              <p className="text-gray-600">
                {orgData.name}のアカウントが作成されました。<br />
                30日間の無料トライアルを開始します。
              </p>
            </div>

            {/* 次のステップ */}
            <div className="bg-blue-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">次のステップ</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>職員を追加して、チームメンバーを招待しましょう</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>利用者情報を登録して、サービスの記録を開始しましょう</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>設定を確認して、事業所情報をカスタマイズしましょう</span>
                </li>
              </ul>
            </div>

            {/* トライアル情報 */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>トライアル期間:</strong> 今日から30日間<br />
                トライアル期間中は全機能を無料でお試しいただけます。
              </p>
            </div>

            {/* ダッシュボードへ */}
            <button
              onClick={() => router.push('/')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ダッシュボードへ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
