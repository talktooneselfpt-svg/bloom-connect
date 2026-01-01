/**
 * 利用者データのFirestore操作
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
import { db, getCollectionName } from "@/lib/firebase"
import { Client } from "@/types/client"

/**
 * 利用者を新規作成
 */
export async function createClient(clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const clientRef = doc(collection(db, getCollectionName('clients')))

  await setDoc(clientRef, {
    ...clientData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })

  return clientRef.id
}

/**
 * 利用者情報を取得
 */
export async function getClient(clientId: string): Promise<Client | null> {
  const clientRef = doc(db, getCollectionName('clients'), clientId)
  const clientSnap = await getDoc(clientRef)

  if (!clientSnap.exists()) {
    return null
  }

  return {
    id: clientSnap.id,
    ...clientSnap.data()
  } as Client
}

/**
 * 利用者情報を更新
 */
export async function updateClient(
  clientId: string,
  updates: Partial<Omit<Client, "id" | "createdAt" | "createdBy">>,
  updatedBy: string
): Promise<void> {
  const clientRef = doc(db, getCollectionName('clients'), clientId)

  await updateDoc(clientRef, {
    ...updates,
    updatedBy,
    updatedAt: serverTimestamp()
  })
}

/**
 * すべての利用者を取得
 */
export async function getAllClients(): Promise<Client[]> {
  const querySnapshot = await getDocs(collection(db, getCollectionName('clients')))
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Client))
}

/**
 * 組織の全利用者を取得
 */
export async function getClientsByOrganization(organizationId: string): Promise<Client[]> {
  const q = query(
    collection(db, getCollectionName('clients')),
    where("organizationId", "==", organizationId),
    orderBy("nameKana", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Client))
}

/**
 * アクティブな利用者のみを取得
 */
export async function getActiveClients(organizationId: string): Promise<Client[]> {
  const q = query(
    collection(db, getCollectionName('clients')),
    where("organizationId", "==", organizationId),
    where("isActive", "==", true),
    orderBy("nameKana", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Client))
}

/**
 * 利用者を退所処理（論理削除）
 */
export async function retireClient(clientId: string, retiredBy: string): Promise<void> {
  const clientRef = doc(db, getCollectionName('clients'), clientId)

  await updateDoc(clientRef, {
    isActive: false,
    retiredAt: serverTimestamp(),
    retiredBy,
    updatedAt: serverTimestamp(),
    updatedBy: retiredBy
  })
}

/**
 * 利用者を再アクティブ化
 */
export async function reactivateClient(clientId: string, updatedBy: string): Promise<void> {
  const clientRef = doc(db, getCollectionName('clients'), clientId)

  await updateDoc(clientRef, {
    isActive: true,
    retiredAt: null,
    retiredBy: null,
    updatedAt: serverTimestamp(),
    updatedBy
  })
}

/**
 * 介護度でフィルタリング
 */
export async function getClientsByCareLevel(
  organizationId: string,
  careLevel: string
): Promise<Client[]> {
  const q = query(
    collection(db, getCollectionName('clients')),
    where("organizationId", "==", organizationId),
    where("careLevel", "==", careLevel),
    where("isActive", "==", true),
    orderBy("nameKana", "asc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Client))
}
