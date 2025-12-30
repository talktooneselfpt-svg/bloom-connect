'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { csvToObjects, downloadCSV, objectsToCSV } from '@/lib/utils/csvParser'
import { createStaffWithAuth } from '@/lib/auth/staff'
import { generateStaffEmail } from '@/lib/utils/email'
import { generateTemporaryPassword } from '@/lib/utils/idGenerator'
import RouteGuard from '@/components/RouteGuard'
import { useAuth } from '@/lib/hooks/useAuth'
import { getOrganization } from '@/lib/firestore/organizations'

interface StaffImportRow {
  staffNumber: string
  nameKanji: string
  nameKana: string
  jobTypes: string  // カンマ区切りの文字列
  position: string
  role: string
  department?: string
  employmentType?: string
  phoneCompany: string
  phonePersonal?: string
  hireDate?: string
  licenseNumber?: string
  emergencyContact?: string
  memo?: string
}

interface ImportResult {
  success: boolean
  row: number
  staffNumber: string
  nameKanji: string
  message: string
  temporaryPassword?: string
}

export default function StaffImportPage() {
  const router = useRouter()
  const { staff: currentStaff, uid } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [organizationCode, setOrganizationCode] = useState<string>('')

  // 組織コードを取得
  useEffect(() => {
    if (currentStaff?.organizationId) {
      getOrganization(currentStaff.organizationId).then(org => {
        if (org) {
          setOrganizationCode(org.organizationCode)
        }
      })
    }
  }, [currentStaff?.organizationId])

  // サンプルCSVをダウンロード
  const handleDownloadSample = () => {
    const sampleData = [
      {
        staffNumber: '001',
        nameKanji: '山田 太郎',
        nameKana: 'やまだ たろう',
        jobTypes: '介護福祉士,看護師',
        position: 'スタッフ',
        role: 'スタッフ',
        department: '訪問介護部',
        employmentType: '常勤',
        phoneCompany: '03-1234-5678',
        phonePersonal: '090-1234-5678',
        hireDate: '2025-04-01',
        licenseNumber: '12345678',
        emergencyContact: '090-9999-9999（家族）',
        memo: '備考欄',
      },
    ]

    const headers = [
      'staffNumber',
      'nameKanji',
      'nameKana',
      'jobTypes',
      'position',
      'role',
      'department',
      'employmentType',
      'phoneCompany',
      'phonePersonal',
      'hireDate',
      'licenseNumber',
      'emergencyContact',
      'memo',
    ]

    const csv = objectsToCSV(sampleData, headers)
    downloadCSV('職員インポートサンプル.csv', csv)
  }

  // CSVファイルを読み込み
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvText = event.target?.result as string
      await processCSV(csvText)
    }
    reader.readAsText(file, 'UTF-8')
  }

  // CSVデータを処理してインポート
  const processCSV = async (csvText: string) => {
    setIsProcessing(true)
    setResults([])
    setShowResults(false)

    try {
      const data = csvToObjects<StaffImportRow>(csvText)
      // 認証チェック
      if (!uid || !currentStaff?.organizationId) {
        throw new Error('ユーザー情報または組織情報が見つかりません')
      }

      if (!organizationCode) {
        throw new Error('組織コードが取得できません')
      }

      const importResults: ImportResult[] = []

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2 // ヘッダー行を除く

        try {
          // バリデーション
          if (!row.staffNumber) {
            throw new Error('職員番号は必須です')
          }
          if (!row.nameKanji || !row.nameKana) {
            throw new Error('氏名は必須です')
          }
          if (!row.jobTypes) {
            throw new Error('職種は必須です')
          }
          if (!row.position) {
            throw new Error('役職は必須です')
          }
          if (!row.role) {
            throw new Error('権限ロールは必須です')
          }

          // メールアドレスと一時パスワードを生成
          const email = generateStaffEmail(row.staffNumber, organizationCode)
          const tempPassword = generateTemporaryPassword()

          // 職員データを準備
          const staffData: any = {
            organizationId: currentStaff.organizationId,
            staffNumber: row.staffNumber,
            nameKanji: row.nameKanji,
            nameKana: row.nameKana,
            jobTypes: row.jobTypes.split(',').map(j => j.trim()).filter(j => j),
            position: row.position,
            role: row.role,
            phoneCompany: row.phoneCompany,
            email,
            isActive: true,
            passwordSetupCompleted: false,
            createdBy: uid,
            updatedBy: uid,
          }

          // 任意フィールド
          if (row.department?.trim()) staffData.department = row.department.trim()
          if (row.employmentType?.trim()) staffData.employmentType = row.employmentType.trim()
          if (row.phonePersonal?.trim()) staffData.phonePersonal = row.phonePersonal.trim()
          if (row.hireDate?.trim()) staffData.hireDate = row.hireDate.trim()
          if (row.licenseNumber?.trim()) staffData.licenseNumber = row.licenseNumber.trim()
          if (row.emergencyContact?.trim()) staffData.emergencyContact = row.emergencyContact.trim()
          if (row.memo?.trim()) staffData.memo = row.memo.trim()

          // 職員を作成
          await createStaffWithAuth(email, tempPassword, staffData)

          importResults.push({
            success: true,
            row: rowNumber,
            staffNumber: row.staffNumber,
            nameKanji: row.nameKanji,
            message: 'インポート成功',
            temporaryPassword: tempPassword,
          })
        } catch (error: any) {
          importResults.push({
            success: false,
            row: rowNumber,
            staffNumber: row.staffNumber || '不明',
            nameKanji: row.nameKanji || '不明',
            message: error.message || 'インポート失敗',
          })
        }
      }

      setResults(importResults)
      setShowResults(true)
    } catch (error: any) {
      alert('CSVファイルの読み込みに失敗しました: ' + error.message)
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // 結果をCSVでダウンロード
  const handleDownloadResults = () => {
    const data = results.map(r => ({
      行番号: r.row,
      職員番号: r.staffNumber,
      氏名: r.nameKanji,
      結果: r.success ? '成功' : '失敗',
      メッセージ: r.message,
      一時パスワード: r.temporaryPassword || '',
    }))

    const headers = ['行番号', '職員番号', '氏名', '結果', 'メッセージ', '一時パスワード']
    const csv = objectsToCSV(data, headers)
    downloadCSV('インポート結果.csv', csv)
  }

  const successCount = results.filter(r => r.success).length
  const failureCount = results.filter(r => !r.success).length

  return (
    <RouteGuard>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">職員データCSVインポート</h1>

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">インポート方法</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>サンプルCSVファイルをダウンロードして、フォーマットを確認してください</li>
              <li>ExcelまたはCSV対応ソフトで職員データを入力してください</li>
              <li>UTF-8形式のCSVファイルとして保存してください</li>
              <li>下のファイル選択ボタンからCSVファイルをアップロードしてください</li>
            </ol>
          </div>

          {/* CSV形式の説明 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">CSVファイル形式</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-gray-700">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left p-2">列名</th>
                    <th className="text-left p-2">必須</th>
                    <th className="text-left p-2">説明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-2 font-mono">staffNumber</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">職員番号（例: 001）</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">nameKanji</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">氏名（漢字）</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">nameKana</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">氏名（ひらがな）</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">jobTypes</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">職種（複数の場合はカンマ区切り、例: 介護福祉士,看護師）</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">position</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">役職</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">role</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">権限ロール</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">phoneCompany</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">会社用電話番号</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">department</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">所属部署</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">employmentType</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">勤務形態</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">phonePersonal</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">個人用電話番号</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">hireDate</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">入社日（YYYY-MM-DD形式）</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">licenseNumber</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">資格番号</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">emergencyContact</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">緊急連絡先</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">memo</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">メモ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* アクション */}
          <div className="space-y-4">
            <button
              onClick={handleDownloadSample}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              サンプルCSVをダウンロード
            </button>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isProcessing}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className={`w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    処理中...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    CSVファイルを選択してインポート
                  </>
                )}
              </label>
            </div>

            <button
              onClick={() => router.back()}
              className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              戻る
            </button>
          </div>

          {/* インポート結果 */}
          {showResults && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">インポート結果</h2>
                <button
                  onClick={handleDownloadResults}
                  className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  結果をダウンロード
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 mb-1">成功</p>
                  <p className="text-3xl font-bold text-green-900">{successCount}</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 mb-1">失敗</p>
                  <p className="text-3xl font-bold text-red-900">{failureCount}</p>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3">行</th>
                      <th className="text-left p-3">職員番号</th>
                      <th className="text-left p-3">氏名</th>
                      <th className="text-left p-3">結果</th>
                      <th className="text-left p-3">メッセージ</th>
                      <th className="text-left p-3">一時パスワード</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="p-3">{result.row}</td>
                        <td className="p-3 font-mono">{result.staffNumber}</td>
                        <td className="p-3">{result.nameKanji}</td>
                        <td className="p-3">
                          {result.success ? (
                            <span className="text-green-700 font-medium">✓ 成功</span>
                          ) : (
                            <span className="text-red-700 font-medium">✗ 失敗</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-700">{result.message}</td>
                        <td className="p-3 font-mono text-xs">
                          {result.temporaryPassword || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </RouteGuard>
  )
}
