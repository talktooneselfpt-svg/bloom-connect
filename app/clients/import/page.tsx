'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { csvToObjects, downloadCSV, objectsToCSV } from '@/lib/utils/csvParser'
import { createClient } from '@/lib/firestore/clients'
import RouteGuard from '@/components/RouteGuard'

interface ClientImportRow {
  clientNumber: string
  nameKanji: string
  nameKana: string
  birthDate?: string
  gender?: string
  postalCode?: string
  prefecture?: string
  city?: string
  address?: string
  phoneHome?: string
  phonePersonal?: string
  email?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
  careLevel?: string
  disabilities?: string
  medicalHistory?: string
  allergies?: string
  medications?: string
  memo?: string
}

interface ImportResult {
  success: boolean
  row: number
  clientNumber: string
  nameKanji: string
  message: string
}

export default function ClientImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<ImportResult[]>([])
  const [showResults, setShowResults] = useState(false)

  // サンプルCSVをダウンロード
  const handleDownloadSample = () => {
    const sampleData = [
      {
        clientNumber: '001',
        nameKanji: '佐藤 花子',
        nameKana: 'さとう はなこ',
        birthDate: '1950-01-01',
        gender: '女性',
        postalCode: '100-0001',
        prefecture: '東京都',
        city: '千代田区',
        address: '千代田1-1-1',
        phoneHome: '03-1111-1111',
        phonePersonal: '090-1111-1111',
        email: 'hanako@example.com',
        emergencyContactName: '佐藤 太郎',
        emergencyContactPhone: '090-2222-2222',
        emergencyContactRelation: '息子',
        careLevel: '要介護2',
        disabilities: '身体障害者手帳3級',
        medicalHistory: '高血圧、糖尿病',
        allergies: '卵アレルギー',
        medications: '血圧の薬、糖尿病の薬',
        memo: '備考欄',
      },
    ]

    const headers = [
      'clientNumber',
      'nameKanji',
      'nameKana',
      'birthDate',
      'gender',
      'postalCode',
      'prefecture',
      'city',
      'address',
      'phoneHome',
      'phonePersonal',
      'email',
      'emergencyContactName',
      'emergencyContactPhone',
      'emergencyContactRelation',
      'careLevel',
      'disabilities',
      'medicalHistory',
      'allergies',
      'medications',
      'memo',
    ]

    const csv = objectsToCSV(sampleData, headers)
    downloadCSV('利用者インポートサンプル.csv', csv)
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
      const data = csvToObjects<ClientImportRow>(csvText)
      const importResults: ImportResult[] = []

      // 仮データ（実際にはログインユーザー情報を使用）
      const currentUserId = 'temp-user-id'
      const organizationId = 'temp-org-id'

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNumber = i + 2 // ヘッダー行を除く

        try {
          // バリデーション
          if (!row.clientNumber) {
            throw new Error('利用者番号は必須です')
          }
          if (!row.nameKanji || !row.nameKana) {
            throw new Error('氏名は必須です')
          }

          // 利用者データを準備
          const clientData: any = {
            organizationId,
            clientNumber: row.clientNumber,
            nameKanji: row.nameKanji,
            nameKana: row.nameKana,
            isActive: true,
            createdBy: currentUserId,
            updatedBy: currentUserId,
          }

          // 任意フィールド
          if (row.birthDate?.trim()) clientData.birthDate = row.birthDate.trim()
          if (row.gender?.trim()) clientData.gender = row.gender.trim()
          if (row.postalCode?.trim()) clientData.postalCode = row.postalCode.trim()
          if (row.prefecture?.trim()) clientData.prefecture = row.prefecture.trim()
          if (row.city?.trim()) clientData.city = row.city.trim()
          if (row.address?.trim()) clientData.address = row.address.trim()
          if (row.phoneHome?.trim()) clientData.phoneHome = row.phoneHome.trim()
          if (row.phonePersonal?.trim()) clientData.phonePersonal = row.phonePersonal.trim()
          if (row.email?.trim()) clientData.email = row.email.trim()
          if (row.emergencyContactName?.trim()) clientData.emergencyContactName = row.emergencyContactName.trim()
          if (row.emergencyContactPhone?.trim()) clientData.emergencyContactPhone = row.emergencyContactPhone.trim()
          if (row.emergencyContactRelation?.trim()) clientData.emergencyContactRelation = row.emergencyContactRelation.trim()
          if (row.careLevel?.trim()) clientData.careLevel = row.careLevel.trim()
          if (row.disabilities?.trim()) clientData.disabilities = row.disabilities.trim()
          if (row.medicalHistory?.trim()) clientData.medicalHistory = row.medicalHistory.trim()
          if (row.allergies?.trim()) clientData.allergies = row.allergies.trim()
          if (row.medications?.trim()) clientData.medications = row.medications.trim()
          if (row.memo?.trim()) clientData.memo = row.memo.trim()

          // 利用者を作成
          await createClient(clientData)

          importResults.push({
            success: true,
            row: rowNumber,
            clientNumber: row.clientNumber,
            nameKanji: row.nameKanji,
            message: 'インポート成功',
          })
        } catch (error: any) {
          importResults.push({
            success: false,
            row: rowNumber,
            clientNumber: row.clientNumber || '不明',
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
      利用者番号: r.clientNumber,
      氏名: r.nameKanji,
      結果: r.success ? '成功' : '失敗',
      メッセージ: r.message,
    }))

    const headers = ['行番号', '利用者番号', '氏名', '結果', 'メッセージ']
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">利用者データCSVインポート</h1>

          {/* 説明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">インポート方法</h3>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>サンプルCSVファイルをダウンロードして、フォーマットを確認してください</li>
              <li>ExcelまたはCSV対応ソフトで利用者データを入力してください</li>
              <li>UTF-8形式のCSVファイルとして保存してください</li>
              <li>下のファイル選択ボタンからCSVファイルをアップロードしてください</li>
            </ol>
          </div>

          {/* CSV形式の説明 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">CSVファイル形式（主要項目）</h3>
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
                    <td className="p-2 font-mono">clientNumber</td>
                    <td className="p-2 text-red-600">必須</td>
                    <td className="p-2">利用者番号（例: 001）</td>
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
                    <td className="p-2 font-mono">birthDate</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">生年月日（YYYY-MM-DD形式）</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">gender</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">性別</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">phoneHome</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">自宅電話番号</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">careLevel</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">介護度</td>
                  </tr>
                  <tr>
                    <td className="p-2 font-mono">medicalHistory</td>
                    <td className="p-2 text-gray-500">任意</td>
                    <td className="p-2">既往歴</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              ※ その他の項目はサンプルCSVをダウンロードして確認してください
            </p>
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
                      <th className="text-left p-3">利用者番号</th>
                      <th className="text-left p-3">氏名</th>
                      <th className="text-left p-3">結果</th>
                      <th className="text-left p-3">メッセージ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {results.map((result, index) => (
                      <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="p-3">{result.row}</td>
                        <td className="p-3 font-mono">{result.clientNumber}</td>
                        <td className="p-3">{result.nameKanji}</td>
                        <td className="p-3">
                          {result.success ? (
                            <span className="text-green-700 font-medium">✓ 成功</span>
                          ) : (
                            <span className="text-red-700 font-medium">✗ 失敗</span>
                          )}
                        </td>
                        <td className="p-3 text-gray-700">{result.message}</td>
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
