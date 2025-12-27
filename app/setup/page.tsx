'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganization, isOrganizationCodeAvailable } from '@/lib/firestore/organizations'
import { createStaffWithAuth } from '@/lib/auth/staff'
import { JOB_TYPES, POSITIONS } from '@/types/staff'
import { ORGANIZATION_TYPES, PREFECTURES } from '@/types/organization'
import { serverTimestamp } from 'firebase/firestore'
import { generateOrganizationCode, generateStaffNumber, generateTemporaryPassword } from '@/lib/utils/idGenerator'
import { generateStaffEmail } from '@/lib/utils/email'

export default function SetupPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState<string>('')
  const [generatedOrgCode, setGeneratedOrgCode] = useState<string>('')
  const [generatedStaffNumber, setGeneratedStaffNumber] = useState<string>('')

  // 事業所情報
  const [orgData, setOrgData] = useState({
    organizationCode: '',
    name: '',
    nameKana: '',
    type: '',
    typeOther: '',
    postalCode: '',
    prefecture: '',
    city: '',
    address: '',
    phoneNumber: '',
    email: '',
  })

  // 代表者情報
  const [adminData, setAdminData] = useState({
    staffNumber: '',
    nameKanji: '',
    nameKana: '',
    phoneCompany: '',
    phonePersonal: '',
    jobType: '',
    jobTypeOther: '',
    position: '代表',
  })

  // 画面起動時に事業所番号と職員番号を自動生成
  useEffect(() => {
    const orgCode = generateOrganizationCode()
    const staffNum = generateStaffNumber()
    setGeneratedOrgCode(orgCode)
    setGeneratedStaffNumber(staffNum)
    setOrgData(prev => ({ ...prev, organizationCode: orgCode }))
    setAdminData(prev => ({ ...prev, staffNumber: staffNum }))
  }, [])

  const handleOrgSubmit = (e: FormEvent) => {
    e.preventDefault()

    // バリデーション
    if (!orgData.name || !orgData.type || !orgData.phoneNumber || !orgData.email) {
      setError('必須項目を入力してください')
      return
    }
    if (orgData.type === 'その他' && !orgData.typeOther) {
      setError('事業所種別の詳細を入力してください')
      return
    }

    setError('')
    setStep(2)
  }

  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // バリデーション
    if (!adminData.nameKanji || !adminData.nameKana) {
      setError('代表者の氏名は必須項目です')
      return
    }
    if (!adminData.jobType) {
      setError('職種は必須項目です')
      return
    }
    if (adminData.jobType === 'その他（自由記載）' && !adminData.jobTypeOther) {
      setError('職種の詳細を入力してください')
      return
    }
    if (!adminData.phoneCompany) {
      setError('電話番号は必須項目です')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. 一時パスワードを生成
      const tempPassword = generateTemporaryPassword()
      setTemporaryPassword(tempPassword)

      // 2. 事業所コードの重複チェック
      const isAvailable = await isOrganizationCodeAvailable(orgData.organizationCode)
      if (!isAvailable) {
        throw new Error('この事業所番号は既に使用されています。ページを再読み込みしてください。')
      }

      // 3. 事業所データの準備
      const organizationData: any = {
        organizationCode: orgData.organizationCode,
        name: orgData.name,
        phone: orgData.phoneNumber,
        email: orgData.email,
        organizationType: orgData.type,
        administratorName: adminData.nameKanji,
        isActive: true,
        createdBy: 'system', // 初回セットアップなので system
        updatedBy: 'system',
      }

      // 任意フィールドの処理
      if (orgData.typeOther?.trim()) {
        organizationData.organizationTypeOther = orgData.typeOther.trim()
      }
      if (orgData.nameKana?.trim()) {
        organizationData.nameKana = orgData.nameKana.trim()
      }
      if (orgData.prefecture?.trim()) {
        organizationData.prefecture = orgData.prefecture.trim()
      }
      if (orgData.city?.trim()) {
        organizationData.city = orgData.city.trim()
      }
      if (orgData.address?.trim()) {
        organizationData.addressLine = orgData.address.trim()
      }
      if (orgData.postalCode?.trim()) {
        organizationData.postalCode = orgData.postalCode.trim()
      }

      // 規約同意情報（後で追加する場合）
      organizationData.termsAgreement = {
        version: '1.0',
        agreedAt: serverTimestamp(),
        agreedBy: 'representative',
      }

      // 4. 事業所を作成
      const organizationId = await createOrganization(organizationData)

      // 5. 代表者のメールアドレスを生成
      const email = generateStaffEmail(adminData.staffNumber, orgData.organizationCode)

      // 6. 代表者データの準備
      const staffData: any = {
        organizationId,
        staffNumber: adminData.staffNumber,
        nameKanji: adminData.nameKanji,
        nameKana: adminData.nameKana,
        jobType: adminData.jobType,
        position: adminData.position,
        role: '管理者', // 代表者は管理者権限
        phoneCompany: adminData.phoneCompany,
        email,
        isActive: true,
        passwordSetupCompleted: false, // 初回ログイン時にパスワード設定が必要
        createdBy: 'system',
        updatedBy: 'system',
      }

      // 任意フィールドの処理
      if (adminData.jobTypeOther?.trim()) {
        staffData.jobTypeOther = adminData.jobTypeOther.trim()
      }
      if (adminData.phonePersonal?.trim()) {
        staffData.phonePersonal = adminData.phonePersonal.trim()
      }

      // 7. 代表者（職員）を作成
      await createStaffWithAuth(email, tempPassword, staffData)

      // 8. 成功画面を表示
      setSuccess(true)

      // 10秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push('/auth/login')
      }, 10000)
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

  // 成功画面を表示
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">セットアップ完了！</h2>
          <p className="text-gray-600 mb-6 text-center">
            ブルームコネクトへようこそ。<br />
            事業所と代表者の登録が完了しました。
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-yellow-800 mb-2">⚠️ 一時パスワード</h3>
            <p className="text-xs text-yellow-700 mb-3">
              以下のパスワードは必ずメモしてください。初回ログイン時に新しいパスワードの設定が必要です。
            </p>
            <div className="bg-white rounded border border-yellow-300 p-3 font-mono text-lg text-center select-all">
              {temporaryPassword}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">ログイン情報</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><span className="font-medium">事業所番号:</span> {orgData.organizationCode}</p>
              <p><span className="font-medium">職員番号:</span> {adminData.staffNumber}</p>
              <p><span className="font-medium">氏名:</span> {adminData.nameKanji}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-green-800 mb-1">🎉 無料プラン</h3>
            <p className="text-xs text-green-700">
              代表者1名は無料でご利用いただけます。追加職員の登録で各種プランにアップグレード可能です。
            </p>
          </div>

          <p className="text-xs text-gray-500 text-center mb-4">
            10秒後に自動的にログインページへ移動します
          </p>

          <button
            onClick={() => router.push('/auth/login')}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            ログインページへ
          </button>
        </div>
      </div>
    )
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

        {/* プラン情報 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-green-800 mb-1">🎉 無料プラン</h3>
          <p className="text-xs text-green-700">
            代表者1名は無料でご利用いただけます。アカウント登録でコミュニティーへの参加も可能です。
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
            <div className="w-24 h-1 bg-gray-300 mx-2"></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* ステップ1: 事業所情報 */}
        {step === 1 && (
          <form onSubmit={handleOrgSubmit} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ステップ1: 事業所情報
            </h2>

            {/* 事業所番号（自動生成） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事業所番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orgData.organizationCode}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                自動生成された事業所番号です（ログイン時に使用）
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事業所名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orgData.name}
                onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: 〇〇訪問看護ステーション"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事業所名（ひらがな）
              </label>
              <input
                type="text"
                value={orgData.nameKana}
                onChange={(e) => setOrgData({ ...orgData, nameKana: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="例: まるまるほうもんかんご"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                事業所種別 <span className="text-red-500">*</span>
              </label>
              <select
                value={orgData.type}
                onChange={(e) => setOrgData({ ...orgData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
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

            {/* 事業所種別その他（自由記載） */}
            {orgData.type === 'その他' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  事業所種別の詳細 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orgData.typeOther}
                  onChange={(e) => setOrgData({ ...orgData, typeOther: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="例: 配食サービス"
                  required
                />
              </div>
            )}

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

            {/* 職員番号（自動生成） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                職員番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={adminData.staffNumber}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                自動生成された職員番号です（ログイン時に使用）
              </p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="山田 太郎"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  氏名（ひらがな） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminData.nameKana}
                  onChange={(e) => setAdminData({ ...adminData, nameKana: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="やまだ たろう"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                職種 <span className="text-red-500">*</span>
              </label>
              <select
                value={adminData.jobType}
                onChange={(e) => setAdminData({ ...adminData, jobType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">選択してください</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* 職種その他（自由記載） */}
            {adminData.jobType === 'その他（自由記載）' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  職種の詳細 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminData.jobTypeOther}
                  onChange={(e) => setAdminData({ ...adminData, jobTypeOther: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="例: 調理師"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社用電話番号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={adminData.phoneCompany}
                  onChange={(e) => setAdminData({ ...adminData, phoneCompany: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="090-1234-5678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  個人用電話番号（任意）
                </label>
                <input
                  type="tel"
                  value={adminData.phonePersonal}
                  onChange={(e) => setAdminData({ ...adminData, phonePersonal: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="090-9876-5432"
                />
              </div>
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
      </div>
    </div>
  )
}
