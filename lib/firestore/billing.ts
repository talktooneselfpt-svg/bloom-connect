/**
 * 請求データのFirestore操作
 */

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  setDoc,
  serverTimestamp
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface BillingRecord {
  id: string
  organizationId: string
  organizationName: string
  plan: string
  amount: number
  status: "paid" | "pending" | "overdue" | "cancelled"
  billingDate: Timestamp
  paidDate?: Timestamp
  invoiceNumber: string
  createdAt: Timestamp
}

const BILLING_COLLECTION = "billing"

/**
 * 請求レコードを作成
 */
export async function createBillingRecord(
  billingData: Omit<BillingRecord, "id" | "createdAt">
): Promise<string> {
  const billingRef = doc(collection(db, BILLING_COLLECTION))

  await setDoc(billingRef, {
    ...billingData,
    createdAt: serverTimestamp()
  })

  return billingRef.id
}

/**
 * すべての請求レコードを取得
 */
export async function getAllBillingRecords(): Promise<BillingRecord[]> {
  const q = query(
    collection(db, BILLING_COLLECTION),
    orderBy("billingDate", "desc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BillingRecord))
}

/**
 * ステータスでフィルタリング
 */
export async function getBillingRecordsByStatus(
  status: "paid" | "pending" | "overdue" | "cancelled"
): Promise<BillingRecord[]> {
  const q = query(
    collection(db, BILLING_COLLECTION),
    where("status", "==", status),
    orderBy("billingDate", "desc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BillingRecord))
}

/**
 * 期間でフィルタリング
 */
export async function getBillingRecordsByPeriod(
  startDate: Date,
  endDate: Date
): Promise<BillingRecord[]> {
  const q = query(
    collection(db, BILLING_COLLECTION),
    where("billingDate", ">=", Timestamp.fromDate(startDate)),
    where("billingDate", "<=", Timestamp.fromDate(endDate)),
    orderBy("billingDate", "desc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BillingRecord))
}

/**
 * 事業所別の請求レコードを取得
 */
export async function getBillingRecordsByOrganization(
  organizationId: string
): Promise<BillingRecord[]> {
  const q = query(
    collection(db, BILLING_COLLECTION),
    where("organizationId", "==", organizationId),
    orderBy("billingDate", "desc")
  )

  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as BillingRecord))
}
