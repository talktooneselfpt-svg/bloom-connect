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

/**
 * コミュニティ投稿の画像をアップロードする
 * @param files - アップロードする画像ファイルの配列
 * @returns アップロードされた画像のURL配列
 */
export async function uploadPostImages(files: File[]): Promise<string[]> {
  // ファイルタイプのバリデーション
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error("画像ファイルはJPEG、PNG、またはWebP形式のみアップロード可能です")
    }
  }

  // ファイルサイズのバリデーション（各5MB以下）
  const maxSize = 5 * 1024 * 1024 // 5MB
  for (const file of files) {
    if (file.size > maxSize) {
      throw new Error("各画像ファイルは5MB以下にしてください")
    }
  }

  try {
    const uploadPromises = files.map(async (file) => {
      // ユニークなファイル名を生成
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 9)
      const extension = file.name.split(".").pop()
      const fileName = `${timestamp}-${randomStr}.${extension}`

      // Storage参照を作成
      const storageRef = ref(storage, `posts/${fileName}`)

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
    })

    const urls = await Promise.all(uploadPromises)
    return urls
  } catch (error) {
    console.error("画像のアップロードに失敗しました:", error)
    throw new Error("画像のアップロードに失敗しました。もう一度お試しください。")
  }
}

/**
 * 投稿画像を削除する
 * @param imageUrl - 削除する画像のURL
 */
export async function deletePostImage(imageUrl: string): Promise<void> {
  try {
    // URLからファイル名を抽出
    const fileName = imageUrl.split("/").pop()?.split("?")[0]
    if (!fileName) {
      throw new Error("無効な画像URLです")
    }

    // Storage参照を作成
    const storageRef = ref(storage, `posts/${decodeURIComponent(fileName)}`)

    // ファイルを削除
    await deleteObject(storageRef)
  } catch (error) {
    console.error("画像の削除に失敗しました:", error)
    // 削除失敗は致命的ではないのでエラーをスローしない
  }
}
