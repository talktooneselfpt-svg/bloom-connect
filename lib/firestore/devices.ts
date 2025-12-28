/**
 * デバイス管理のFirestore操作
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Device, CreateDeviceInput, UpdateDeviceInput } from '@/types/device'

const DEVICES_COLLECTION = 'devices'

/**
 * UUIDv4を生成（デバイストークン用）
 */
function generateDeviceToken(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * デバイスを作成
 */
export async function createDevice(
  organizationId: string,
  input: CreateDeviceInput,
  createdBy: string
): Promise<string> {
  const deviceData: Omit<Device, 'id'> = {
    organizationId,
    deviceName: input.deviceName,
    deviceType: input.deviceType || 'tablet',
    assignedStaffIds: input.assignedStaffIds || [],
    maxStaff: 3, // 固定で3名まで
    isActive: true,
    description: input.description,
    serialNumber: input.serialNumber,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    createdBy,
    updatedBy: createdBy,
  }

  const docRef = await addDoc(collection(db, DEVICES_COLLECTION), deviceData)
  return docRef.id
}

/**
 * デバイスを取得（ID指定）
 */
export async function getDevice(deviceId: string): Promise<Device | null> {
  const docRef = doc(db, DEVICES_COLLECTION, deviceId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    return null
  }

  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Device
}

/**
 * 事業所のデバイス一覧を取得
 */
export async function getDevicesByOrganization(
  organizationId: string,
  activeOnly: boolean = false
): Promise<Device[]> {
  const constraints = [
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc'),
  ]

  if (activeOnly) {
    constraints.splice(1, 0, where('isActive', '==', true))
  }

  const q = query(collection(db, DEVICES_COLLECTION), ...constraints)
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Device)
  )
}

/**
 * デバイスを更新
 */
export async function updateDevice(
  deviceId: string,
  input: UpdateDeviceInput,
  updatedBy: string
): Promise<void> {
  const docRef = doc(db, DEVICES_COLLECTION, deviceId)

  const updateData: any = {
    ...input,
    updatedAt: serverTimestamp(),
    updatedBy,
  }

  await updateDoc(docRef, updateData)
}

/**
 * デバイスを削除
 */
export async function deleteDevice(deviceId: string): Promise<void> {
  const docRef = doc(db, DEVICES_COLLECTION, deviceId)
  await deleteDoc(docRef)
}

/**
 * 職員が割り当てられているデバイスを取得
 */
export async function getDevicesByStaff(
  organizationId: string,
  staffId: string
): Promise<Device[]> {
  const q = query(
    collection(db, DEVICES_COLLECTION),
    where('organizationId', '==', organizationId),
    where('assignedStaffIds', 'array-contains', staffId)
  )

  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Device)
  )
}

/**
 * デバイスに職員を割り当て
 */
export async function assignStaffToDevice(
  deviceId: string,
  staffId: string,
  updatedBy: string
): Promise<boolean> {
  const device = await getDevice(deviceId)

  if (!device) {
    throw new Error('デバイスが見つかりません')
  }

  if (device.assignedStaffIds.includes(staffId)) {
    throw new Error('この職員は既に割り当てられています')
  }

  if (device.assignedStaffIds.length >= device.maxStaff) {
    throw new Error(`デバイスの定員（${device.maxStaff}名）に達しています`)
  }

  const updatedStaffIds = [...device.assignedStaffIds, staffId]

  await updateDevice(
    deviceId,
    { assignedStaffIds: updatedStaffIds },
    updatedBy
  )

  return true
}

/**
 * デバイスから職員を解除
 */
export async function removeStaffFromDevice(
  deviceId: string,
  staffId: string,
  updatedBy: string
): Promise<boolean> {
  const device = await getDevice(deviceId)

  if (!device) {
    throw new Error('デバイスが見つかりません')
  }

  if (!device.assignedStaffIds.includes(staffId)) {
    throw new Error('この職員は割り当てられていません')
  }

  const updatedStaffIds = device.assignedStaffIds.filter((id) => id !== staffId)

  await updateDevice(
    deviceId,
    { assignedStaffIds: updatedStaffIds },
    updatedBy
  )

  return true
}

/**
 * デバイスの統計情報を計算
 */
export async function calculateDeviceStats(
  organizationId: string
): Promise<{
  totalDevices: number
  activeDevices: number
  totalAssignedStaff: number
  averageStaffPerDevice: number
  devicesAtCapacity: number
  devicesWithSpace: number
}> {
  const devices = await getDevicesByOrganization(organizationId)
  const activeDevices = devices.filter((d) => d.isActive)

  const totalAssignedStaff = devices.reduce(
    (sum, device) => sum + device.assignedStaffIds.length,
    0
  )

  const averageStaffPerDevice =
    devices.length > 0 ? totalAssignedStaff / devices.length : 0

  const devicesAtCapacity = devices.filter(
    (d) => d.assignedStaffIds.length >= d.maxStaff
  ).length

  const devicesWithSpace = devices.filter(
    (d) => d.assignedStaffIds.length < d.maxStaff
  ).length

  return {
    totalDevices: devices.length,
    activeDevices: activeDevices.length,
    totalAssignedStaff,
    averageStaffPerDevice: Math.round(averageStaffPerDevice * 10) / 10,
    devicesAtCapacity,
    devicesWithSpace,
  }
}

/**
 * 招待コードを使用してデバイスを登録
 * デバイストークンとIPアドレスを自動取得して保存
 */
export async function registerDeviceWithInvitation(
  organizationId: string,
  staffId: string,
  deviceName: string,
  deviceType: 'tablet' | 'smartphone' | 'pc' | 'other',
  registrationIP?: string
): Promise<string> {
  const deviceToken = generateDeviceToken()

  const deviceData: Omit<Device, 'id'> = {
    organizationId,
    deviceName,
    deviceType,
    assignedStaffIds: [staffId], // 招待された職員を自動割り当て
    maxStaff: 3,
    isActive: true,
    deviceToken,
    registrationIP,
    lastAccessIP: registrationIP,
    lastAccessAt: serverTimestamp() as Timestamp,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
    createdBy: staffId,
    updatedBy: staffId,
  }

  const docRef = await addDoc(collection(db, DEVICES_COLLECTION), deviceData)

  // デバイストークンをlocalStorageに保存（クライアント側で実行）
  if (typeof window !== 'undefined') {
    localStorage.setItem('deviceToken', deviceToken)
    localStorage.setItem('deviceId', docRef.id)
  }

  return docRef.id
}

/**
 * デバイストークンでデバイスを取得
 */
export async function getDeviceByToken(
  deviceToken: string
): Promise<Device | null> {
  const q = query(
    collection(db, DEVICES_COLLECTION),
    where('deviceToken', '==', deviceToken)
  )

  const querySnapshot = await getDocs(q)

  if (querySnapshot.empty) {
    return null
  }

  const doc = querySnapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as Device
}

/**
 * デバイスの最終アクセス情報を更新
 */
export async function updateDeviceAccess(
  deviceId: string,
  accessIP?: string
): Promise<void> {
  const docRef = doc(db, DEVICES_COLLECTION, deviceId)

  const updateData: any = {
    lastAccessAt: serverTimestamp(),
  }

  if (accessIP) {
    updateData.lastAccessIP = accessIP
  }

  await updateDoc(docRef, updateData)
}
