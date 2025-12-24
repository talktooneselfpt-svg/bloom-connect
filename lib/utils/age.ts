/**
 * 年齢計算関数
 */

/**
 * 生年月日から現在の年齢を計算
 *
 * @param birthDate 生年月日（YYYY-MM-DD形式）
 * @returns 年齢（整数）
 */
export function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)

  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  // 誕生日がまだ来ていない場合は1歳引く
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * 生年月日から現在の年齢を文字列で取得
 *
 * @param birthDate 生年月日（YYYY-MM-DD形式）
 * @returns 年齢文字列（例: "75歳"）
 */
export function getAgeDisplay(birthDate: string): string {
  const age = calculateAge(birthDate)
  return `${age}歳`
}

/**
 * 生年月日の妥当性をチェック
 *
 * @param birthDate 生年月日（YYYY-MM-DD形式）
 * @returns 妥当な場合はtrue
 */
export function isValidBirthDate(birthDate: string): boolean {
  const birth = new Date(birthDate)
  const today = new Date()

  // 日付が有効か
  if (isNaN(birth.getTime())) {
    return false
  }

  // 未来の日付でないか
  if (birth > today) {
    return false
  }

  // 150歳を超えていないか
  const age = calculateAge(birthDate)
  if (age > 150) {
    return false
  }

  return true
}
