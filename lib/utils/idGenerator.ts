/**
 * ID生成ユーティリティ
 */

/**
 * 事業所番号を自動生成（英数字6桁）
 * 形式: 英数字6桁（例: A1B2C3）
 * 注意: この番号は変更できません
 */
export function generateOrganizationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 紛らわしい文字を除外（I, O, 0, 1）
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * 職員番号を自動生成（数字5桁）
 * 形式: 数字5桁（例: 12345）
 * 注意: この個人番号は変更できません
 */
export function generateStaffNumber(): string {
  // 5桁の数字を生成（10000 ～ 99999）
  const number = Math.floor(10000 + Math.random() * 90000)
  return number.toString()
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

/**
 * 職員初回登録用の一時パスワードを生成
 * 形式: 大文字・小文字・数字を含む12文字のランダム文字列
 */
export function generateTemporaryPassword(): string {
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ' // 紛らわしい文字を除外
  const lowerChars = 'abcdefghjkmnpqrstuvwxyz' // 紛らわしい文字を除外
  const numbers = '23456789' // 0, 1を除外（O, I, lと紛らわしいため）

  // 各カテゴリから最低1文字ずつ選択
  const password = [
    upperChars.charAt(Math.floor(Math.random() * upperChars.length)),
    upperChars.charAt(Math.floor(Math.random() * upperChars.length)),
    lowerChars.charAt(Math.floor(Math.random() * lowerChars.length)),
    lowerChars.charAt(Math.floor(Math.random() * lowerChars.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
  ]

  // 残りの6文字をランダムに追加
  const allChars = upperChars + lowerChars + numbers
  for (let i = 0; i < 6; i++) {
    password.push(allChars.charAt(Math.floor(Math.random() * allChars.length)))
  }

  // シャッフル
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}
