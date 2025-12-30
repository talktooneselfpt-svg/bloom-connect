/**
 * エラーログのFirestore操作
 */

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface ErrorLog {
  id: string
  timestamp: Timestamp
  level: "error" | "warning" | "critical"
  message: string
  service: string
  userId?: string
  organizationId?: string
  stackTrace?: string
  resolved: boolean
  createdAt: Timestamp
}

const ERROR_LOGS_COLLECTION = "errorLogs"

/**
 * エラーログを作成
 */
export async function createErrorLog(
  errorData: Omit<ErrorLog, "id" | "createdAt">
): Promise<string> {
  const errorRef = doc(collection(db, ERROR_LOGS_COLLECTION))

  await setDoc(errorRef, {
    ...errorData,
    createdAt: serverTimestamp()
  })

  return errorRef.id
}

/**
 * すべてのエラーログを取得
 */
export async function getAllErrorLogs(maxResults: number = 100): Promise<ErrorLog[]> {
  const q = query(
    collection(db, ERROR_LOGS_COLLECTION),
    orderBy("timestamp", "desc"),
    limit(maxResults)
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ErrorLog))
}

/**
 * レベルでフィルタリング
 */
export async function getErrorLogsByLevel(
  level: "error" | "warning" | "critical",
  maxResults: number = 100
): Promise<ErrorLog[]> {
  const q = query(
    collection(db, ERROR_LOGS_COLLECTION),
    where("level", "==", level),
    orderBy("timestamp", "desc"),
    limit(maxResults)
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ErrorLog))
}

/**
 * 未解決のエラーログを取得
 */
export async function getUnresolvedErrorLogs(maxResults: number = 100): Promise<ErrorLog[]> {
  const q = query(
    collection(db, ERROR_LOGS_COLLECTION),
    where("resolved", "==", false),
    orderBy("timestamp", "desc"),
    limit(maxResults)
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as ErrorLog))
}

/**
 * エラーログを解決済みにする
 */
export async function resolveErrorLog(errorId: string): Promise<void> {
  const errorRef = doc(db, ERROR_LOGS_COLLECTION, errorId)
  await updateDoc(errorRef, {
    resolved: true
  })
}
