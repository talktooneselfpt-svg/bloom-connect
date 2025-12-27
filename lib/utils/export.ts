/**
 * データエクスポート用のユーティリティ関数
 */

/**
 * データをCSV形式に変換してダウンロード
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('エクスポートするデータがありません')
    return
  }

  try {
    // ヘッダー行の生成
    const keys = Object.keys(data[0]) as (keyof T)[]
    const headerRow = headers
      ? keys.map((key) => headers[key] || String(key))
      : keys.map((key) => String(key))

    // CSV行の生成
    const csvRows: string[] = [
      headerRow.map((header) => escapeCSVValue(header)).join(','),
    ]

    // データ行の生成
    data.forEach((row) => {
      const values = keys.map((key) => {
        const value = row[key]
        return escapeCSVValue(formatValue(value))
      })
      csvRows.push(values.join(','))
    })

    // CSV文字列の結合
    const csvContent = csvRows.join('\n')

    // BOM付きUTF-8でエンコード（Excelで文字化けしないように）
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

    // ダウンロード
    downloadBlob(blob, `${filename}.csv`)
  } catch (error) {
    console.error('CSVエクスポートに失敗しました:', error)
    alert('CSVエクスポートに失敗しました')
  }
}

/**
 * CSV用の値をエスケープ
 */
function escapeCSVValue(value: string): string {
  // ダブルクォートを含む場合はエスケープ
  if (value.includes('"')) {
    value = value.replace(/"/g, '""')
  }

  // カンマ、改行、ダブルクォートを含む場合はダブルクォートで囲む
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    value = `"${value}"`
  }

  return value
}

/**
 * 値を文字列に変換
 */
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'boolean') {
    return value ? 'はい' : 'いいえ'
  }

  if (value instanceof Date) {
    return value.toLocaleString('ja-JP')
  }

  if (typeof value === 'object') {
    // Firestore Timestamp対応
    if (value.toDate && typeof value.toDate === 'function') {
      return value.toDate().toLocaleString('ja-JP')
    }
    return JSON.stringify(value)
  }

  return String(value)
}

/**
 * Blobをダウンロード
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * データをJSON形式でダウンロード
 */
export function exportToJSON<T>(data: T[], filename: string): void {
  if (data.length === 0) {
    alert('エクスポートするデータがありません')
    return
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    downloadBlob(blob, `${filename}.json`)
  } catch (error) {
    console.error('JSONエクスポートに失敗しました:', error)
    alert('JSONエクスポートに失敗しました')
  }
}

/**
 * テーブルデータをHTML形式でダウンロード
 */
export function exportToHTML<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('エクスポートするデータがありません')
    return
  }

  try {
    const keys = Object.keys(data[0]) as (keyof T)[]
    const headerRow = headers
      ? keys.map((key) => headers[key] || String(key))
      : keys.map((key) => String(key))

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      padding: 20px;
    }
    h1 {
      color: #1f2937;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      border: 1px solid #d1d5db;
      padding: 12px;
      text-align: left;
    }
    th {
      background-color: #f3f4f6;
      font-weight: 600;
      color: #374151;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .export-info {
      color: #6b7280;
      font-size: 14px;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="export-info">
    エクスポート日時: ${new Date().toLocaleString('ja-JP')}
  </div>
  <table>
    <thead>
      <tr>
        ${headerRow.map((header) => `<th>${header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row) => `
        <tr>
          ${keys.map((key) => `<td>${formatValue(row[key])}</td>`).join('')}
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
    `

    const blob = new Blob([html], { type: 'text/html;charset=utf-8;' })
    downloadBlob(blob, `${filename}.html`)
  } catch (error) {
    console.error('HTMLエクスポートに失敗しました:', error)
    alert('HTMLエクスポートに失敗しました')
  }
}

/**
 * データを印刷用に表示
 */
export function printData<T extends Record<string, any>>(
  data: T[],
  title: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('印刷するデータがありません')
    return
  }

  try {
    const keys = Object.keys(data[0]) as (keyof T)[]
    const headerRow = headers
      ? keys.map((key) => headers[key] || String(key))
      : keys.map((key) => String(key))

    const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
    }
    h1 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }
    th {
      background-color: #f0f0f0;
      font-weight: 600;
    }
    @media print {
      @page {
        margin: 1cm;
      }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>印刷日時: ${new Date().toLocaleString('ja-JP')}</p>
  <table>
    <thead>
      <tr>
        ${headerRow.map((header) => `<th>${header}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row) => `
        <tr>
          ${keys.map((key) => `<td>${formatValue(row[key])}</td>`).join('')}
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    } else {
      alert('ポップアップがブロックされました。印刷を許可してください。')
    }
  } catch (error) {
    console.error('印刷に失敗しました:', error)
    alert('印刷に失敗しました')
  }
}

/**
 * スタッフデータをエクスポート用に整形
 */
export function formatStaffForExport(staff: any[]): Array<Record<string, any>> {
  return staff.map((s) => ({
    職員番号: s.staffNumber || '',
    '氏名（漢字）': s.nameKanji || '',
    '氏名（カナ）': s.nameKana || '',
    メールアドレス: s.email || '',
    電話番号: s.phoneNumber || '',
    職種: s.jobType || '',
    役割: s.role || '',
    状態: s.isActive ? '有効' : '無効',
    登録日: s.createdAt?.toDate?.()?.toLocaleDateString('ja-JP') || '',
  }))
}

/**
 * 利用者データをエクスポート用に整形
 */
export function formatClientsForExport(clients: any[]): Array<Record<string, any>> {
  return clients.map((c) => ({
    利用者番号: c.clientNumber || '',
    '氏名（漢字）': c.nameKanji || '',
    '氏名（カナ）': c.nameKana || '',
    生年月日: c.birthDate?.toDate?.()?.toLocaleDateString('ja-JP') || '',
    性別: c.gender || '',
    電話番号: c.phoneNumber || '',
    住所: c.address || '',
    緊急連絡先: c.emergencyContact || '',
    状態: c.status || '',
    登録日: c.createdAt?.toDate?.()?.toLocaleDateString('ja-JP') || '',
  }))
}

/**
 * デバイスデータをエクスポート用に整形
 */
export function formatDevicesForExport(devices: any[]): Array<Record<string, any>> {
  return devices.map((d) => ({
    デバイス名: d.deviceName || '',
    デバイス種別: d.deviceType || '',
    シリアル番号: d.serialNumber || '',
    '割り当て職員数': d.assignedStaffIds?.length || 0,
    状態: d.isActive ? '有効' : '無効',
    備考: d.description || '',
    登録日: d.createdAt?.toDate?.()?.toLocaleDateString('ja-JP') || '',
  }))
}
