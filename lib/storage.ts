/**
 * Firebase Storage関連のヘルパー関数
 */

import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "./firebase"

/**
 * 事業所のロゴをアップロードする
 * @param organizationId - 事業所ID
 * @param file - アップロードする画像ファイル
 * @returns アップロードされた画像のURL
 */
export async function uploadOrganizationLogo(
  organizationId: string,
  file: File
): Promise<string> {
  // ファイルタイプのバリデーション
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("画像ファイルはJPEG、PNG、またはWebP形式のみアップロード可能です")
  }

  // ファイルサイズのバリデーション（5MB以下）
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error("画像ファイルは5MB以下にしてください")
  }

  try {
    // ファイル拡張子を取得
    const extension = file.name.split(".").pop()
    const fileName = `logo.${extension}`

    // Storage参照を作成
    const storageRef = ref(storage, `organizations/${organizationId}/${fileName}`)

    // ファイルをアップロード
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    })

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(snapshot.ref)

    return downloadURL
  } catch (error) {
    console.error("ロゴのアップロードに失敗しました:", error)
    throw new Error("ロゴのアップロードに失敗しました。もう一度お試しください。")
  }
}

/**
 * 事業所のロゴを削除する
 * @param organizationId - 事業所ID
 * @param logoUrl - 削除するロゴのURL
 */
export async function deleteOrganizationLogo(
  organizationId: string,
  logoUrl: string
): Promise<void> {
  try {
    // URLからファイル名を抽出
    const fileName = logoUrl.split("/").pop()?.split("?")[0]
    if (!fileName) {
      throw new Error("無効なロゴURLです")
    }

    // Storage参照を作成
    const storageRef = ref(storage, `organizations/${organizationId}/${decodeURIComponent(fileName)}`)

    // ファイルを削除
    await deleteObject(storageRef)
  } catch (error) {
    console.error("ロゴの削除に失敗しました:", error)
    // 削除失敗は致命的ではないのでエラーをスローしない
  }
}
