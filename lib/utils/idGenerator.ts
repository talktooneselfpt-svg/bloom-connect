/**
 * ID生成ユーティリティ
 */

/**
 * 事業所番号を自動生成（6桁以上）
 * 形式: ORG + 6桁のランダム数字（例: ORG123456）
 */
export function generateOrganizationCode(): string {
  const randomDigits = Math.floor(100000 + Math.random() * 900000)
  return `ORG${randomDigits}`
}

/**
 * 職員番号を自動生成（英数字5文字）
 * 形式: 大文字アルファベット2文字 + 数字3桁（例: AB123）
 */
export function generateStaffNumber(): string {
  // 大文字アルファベット2文字を生成
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const letter1 = letters.charAt(Math.floor(Math.random() * letters.length))
  const letter2 = letters.charAt(Math.floor(Math.random() * letters.length))

  // 3桁の数字を生成
  const numbers = Math.floor(100 + Math.random() * 900)

  return `${letter1}${letter2}${numbers}`
}

/**
 * 事業所番号の重複チェック用（Firestoreで使用）
 * @param code チェックする事業所番号
 * @returns 使用可能な場合true
 */
export async function isOrganizationCodeAvailable(code: string): Promise<boolean> {
  // この関数はFirestoreの実装で使用されます
  // lib/firestore/organizations.tsで実装されています
  return true
}

/**
 * 職員番号の重複チェック用（Firestoreで使用）
 * @param number チェックする職員番号
 * @param organizationId 組織ID
 * @returns 使用可能な場合true
 */
export async function isStaffNumberAvailable(number: string, organizationId: string): Promise<boolean> {
  // この関数はFirestoreの実装で使用されます
  // lib/firestore/staff.tsで実装されています
  return true
}
