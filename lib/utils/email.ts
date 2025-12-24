/**
 * メールアドレス生成関数
 */

/**
 * 職員用のメールアドレスを自動生成
 * 形式: {個人番号}@{事業所コード}.bloom-connect.internal
 *
 * @param staffNumber 個人番号（例: "001"）
 * @param organizationCode 事業所コード（例: "ABC1234"）
 * @returns 生成されたメールアドレス
 */
export function generateStaffEmail(
  staffNumber: string,
  organizationCode: string
): string {
  // 個人番号と事業所コードをサニタイズ（英数字のみ許可）
  const sanitizedStaffNumber = staffNumber.replace(/[^a-zA-Z0-9]/g, '');
  const sanitizedOrgCode = organizationCode.replace(/[^a-zA-Z0-9]/g, '');

  return `${sanitizedStaffNumber}@${sanitizedOrgCode}.bloom-connect.internal`;
}

/**
 * 自動生成されたメールアドレスかどうかを判定
 *
 * @param email メールアドレス
 * @returns 自動生成されたメールアドレスの場合 true
 */
export function isGeneratedEmail(email: string): boolean {
  return email.endsWith('.bloom-connect.internal');
}

/**
 * メールアドレスから個人番号と事業所コードを抽出
 *
 * @param email 自動生成されたメールアドレス
 * @returns { staffNumber, organizationCode } または null
 */
export function parseGeneratedEmail(email: string): {
  staffNumber: string;
  organizationCode: string;
} | null {
  if (!isGeneratedEmail(email)) {
    return null;
  }

  const match = email.match(/^([^@]+)@([^.]+)\.bloom-connect\.internal$/);
  if (!match) {
    return null;
  }

  return {
    staffNumber: match[1],
    organizationCode: match[2],
  };
}
