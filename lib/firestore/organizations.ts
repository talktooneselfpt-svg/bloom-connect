/**
 * 事業所データのFirestore操作
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Organization } from "@/types/organization"
import { generateOrganizationCode } from "@/lib/utils/idGenerator"

const ORGANIZATIONS_COLLECTION = "organizations"

/**
 * 事業所を新規作成
 */
export async function createOrganization(
  organizationData: Omit<Organization, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const orgRef = doc(collection(db, ORGANIZATIONS_COLLECTION))

  // 事業所番号が提供されていない場合は自動生成
  let organizationCode = organizationData.organizationCode
  if (!organizationCode) {
    // 一意性を確保するまで生成を繰り返す
    let isUnique = false
    while (!isUnique) {
      organizationCode = generateOrganizationCode()
      isUnique = await isOrganizationCodeAvailable(organizationCode)
    }
  }

  await setDoc(orgRef, {
    ...organizationData,
    organizationCode,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return orgRef.id
}

/**
 * 事業所情報を取得
 */
export async function getOrganization(organizationId: string): Promise<Organization | null> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)
  const orgSnap = await getDoc(orgRef)

  if (!orgSnap.exists()) {
    return null
  }

  return {
    id: orgSnap.id,
    ...orgSnap.data()
  } as Organization
}

/**
 * 事業所情報を更新
 */
export async function updateOrganization(
  organizationId: string,
  updates: Partial<Omit<Organization, "id" | "createdAt" | "createdBy">>,
  updatedBy?: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)

  const updateData: any = {
    ...updates,
    updatedAt: serverTimestamp()
  }

  if (updatedBy) {
    updateData.updatedBy = updatedBy
  }

  await updateDoc(orgRef, updateData)
}

/**
 * 全事業所を取得
 */
export async function getAllOrganizations(): Promise<Organization[]> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    orderBy("name", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Organization))
}

/**
 * アクティブな事業所のみを取得
 */
export async function getActiveOrganizations(): Promise<Organization[]> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where("isActive", "==", true),
    orderBy("name", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Organization))
}

/**
 * 事業所コードで検索
 */
export async function getOrganizationByCode(organizationCode: string): Promise<Organization | null> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where("organizationCode", "==", organizationCode)
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  const doc = querySnapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  } as Organization
}

/**
 * 事業所種別でフィルタリング
 */
export async function getOrganizationsByType(
  organizationType: string
): Promise<Organization[]> {
  const q = query(
    collection(db, ORGANIZATIONS_COLLECTION),
    where("organizationType", "==", organizationType),
    where("isActive", "==", true),
    orderBy("name", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Organization))
}

/**
 * 事業所を無効化
 */
export async function deactivateOrganization(
  organizationId: string,
  updatedBy?: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)

  const updateData: any = {
    isActive: false,
    updatedAt: serverTimestamp()
  }

  if (updatedBy) {
    updateData.updatedBy = updatedBy
  }

  await updateDoc(orgRef, updateData)
}

/**
 * 事業所を再アクティブ化
 */
export async function reactivateOrganization(
  organizationId: string,
  updatedBy?: string
): Promise<void> {
  const orgRef = doc(db, ORGANIZATIONS_COLLECTION, organizationId)

  const updateData: any = {
    isActive: true,
    updatedAt: serverTimestamp()
  }

  if (updatedBy) {
    updateData.updatedBy = updatedBy
  }

  await updateDoc(orgRef, updateData)
}

/**
 * 事業所コードの重複チェック
 */
export async function isOrganizationCodeAvailable(organizationCode: string): Promise<boolean> {
  const org = await getOrganizationByCode(organizationCode)
  return org === null
}
