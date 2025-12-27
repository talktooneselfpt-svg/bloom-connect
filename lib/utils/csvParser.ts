/**
 * CSVファイルをパースする
 */
export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim())
  return lines.map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    values.push(current.trim())
    return values
  })
}

/**
 * CSVデータをオブジェクトの配列に変換
 */
export function csvToObjects<T>(csvText: string): T[] {
  const rows = parseCSV(csvText)
  if (rows.length === 0) return []

  const headers = rows[0]
  const data = rows.slice(1)

  return data.map(row => {
    const obj: any = {}
    headers.forEach((header, index) => {
      obj[header] = row[index] || ''
    })
    return obj as T
  })
}

/**
 * オブジェクトの配列をCSVに変換
 */
export function objectsToCSV<T extends Record<string, any>>(
  data: T[],
  headers: string[]
): string {
  if (data.length === 0) return headers.join(',')

  const rows = [headers.join(',')]

  data.forEach(obj => {
    const values = headers.map(header => {
      const value = obj[header] || ''
      // カンマや改行を含む場合はダブルクォートで囲む
      if (value.toString().includes(',') || value.toString().includes('\n')) {
        return `"${value}"`
      }
      return value
    })
    rows.push(values.join(','))
  })

  return rows.join('\n')
}

/**
 * CSVファイルをダウンロード
 */
export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
