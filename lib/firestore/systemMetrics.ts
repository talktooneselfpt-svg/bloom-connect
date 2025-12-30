/**
 * システムメトリクスのFirestore操作
 */

import {
  collection,
  doc,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
  setDoc,
  serverTimestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface SystemMetric {
  id: string
  timestamp: Timestamp
  service: "webApp" | "api" | "database" | "storage"
  status: "正常" | "警告" | "エラー"
  uptime: number
  responseTime: number
  metrics: Record<string, number>
  createdAt: Timestamp
}

const SYSTEM_METRICS_COLLECTION = "systemMetrics"

/**
 * システムメトリクスを記録
 */
export async function recordSystemMetric(
  metricData: Omit<SystemMetric, "id" | "createdAt">
): Promise<string> {
  const metricRef = doc(collection(db, SYSTEM_METRICS_COLLECTION))

  await setDoc(metricRef, {
    ...metricData,
    createdAt: serverTimestamp()
  })

  return metricRef.id
}

/**
 * 最新のシステムメトリクスを取得
 */
export async function getLatestSystemMetrics(): Promise<SystemMetric[]> {
  const q = query(
    collection(db, SYSTEM_METRICS_COLLECTION),
    orderBy("timestamp", "desc"),
    limit(10)
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SystemMetric))
}

/**
 * サービス別の最新メトリクスを取得
 */
export async function getLatestMetricsByService(
  service: "webApp" | "api" | "database" | "storage"
): Promise<SystemMetric | null> {
  const q = query(
    collection(db, SYSTEM_METRICS_COLLECTION),
    orderBy("timestamp", "desc"),
    limit(1)
  )

  const querySnapshot = await getDocs(q)
  if (querySnapshot.empty) return null

  const doc = querySnapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data()
  } as SystemMetric
}
