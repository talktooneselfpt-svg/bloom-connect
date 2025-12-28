/**
 * デバイス招待コードのFirestore操作
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  DeviceInvitation,
  CreateInvitationInput,
} from '@/types/device-invitation'

const INVITATIONS_COLLECTION = 'deviceInvitations'

/**
 * ランダムな6桁の招待コードを生成
 */
function generateInvitationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * 招待コードが既に存在するかチェック
 */
async function isCodeExists(code: string): Promise<boolean> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('invitationCode', '==', code)
  )
  const snapshot = await getDocs(q)
  return !snapshot.empty
}

/**
 * 重複しない招待コードを生成
 */
async function generateUniqueCode(): Promise<string> {
  let code = generateInvitationCode()
  let attempts = 0
  const maxAttempts = 10

  while (await isCodeExists(code)) {
    code = generateInvitationCode()
    attempts++
    if (attempts >= maxAttempts) {
      throw new Error('招待コードの生成に失敗しました')
    }
  }

  return code
}

/**
 * 招待コードを作成
 */
export async function createInvitation(
  organizationId: string,
  input: CreateInvitationInput,
  createdBy: string,
  createdByName: string
): Promise<DeviceInvitation> {
  const code = await generateUniqueCode()
  const expiresInDays = input.expiresInDays || 7

  const now = Timestamp.now()
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + expiresInDays * 24 * 60 * 60 * 1000
  )

  const invitation: Omit<DeviceInvitation, 'id'> = {
    organizationId,
    invitationCode: code,
    targetStaffId: input.targetStaffId,
    targetStaffName: input.targetStaffName,
    deviceName: input.deviceName,
    deviceType: input.deviceType,
    status: 'pending',
    expiresAt,
    createdAt: now,
    createdBy,
    createdByName,
  }

  const docRef = await addDoc(collection(db, INVITATIONS_COLLECTION), invitation)

  return {
    id: docRef.id,
    ...invitation,
  }
}

/**
 * 組織の招待コード一覧を取得
 */
export async function getInvitationsByOrganization(
  organizationId: string
): Promise<DeviceInvitation[]> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('organizationId', '==', organizationId),
    orderBy('createdAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DeviceInvitation[]
}

/**
 * 招待コードで検索
 */
export async function getInvitationByCode(
  code: string
): Promise<DeviceInvitation | null> {
  const q = query(
    collection(db, INVITATIONS_COLLECTION),
    where('invitationCode', '==', code)
  )

  const snapshot = await getDocs(q)
  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  return {
    id: doc.id,
    ...doc.data(),
  } as DeviceInvitation
}

/**
 * 招待コードを使用済みにする
 */
export async function markInvitationAsUsed(
  invitationId: string,
  deviceId: string
): Promise<void> {
  const docRef = doc(db, INVITATIONS_COLLECTION, invitationId)
  await updateDoc(docRef, {
    status: 'used',
    usedAt: Timestamp.now(),
    registeredDeviceId: deviceId,
  })
}

/**
 * 招待コードを削除（期限切れ等の管理用）
 */
export async function deleteInvitation(invitationId: string): Promise<void> {
  const docRef = doc(db, INVITATIONS_COLLECTION, invitationId)
  await updateDoc(docRef, {
    status: 'expired',
  })
}

/**
 * 招待コードの有効性を確認
 */
export function validateInvitation(invitation: DeviceInvitation): {
  isValid: boolean
  error?: string
} {
  if (invitation.status === 'used') {
    return { isValid: false, error: 'この招待コードは既に使用済みです' }
  }

  if (invitation.status === 'expired') {
    return { isValid: false, error: 'この招待コードは無効です' }
  }

  const now = Timestamp.now()
  if (invitation.expiresAt.toMillis() < now.toMillis()) {
    return { isValid: false, error: 'この招待コードは有効期限が切れています' }
  }

  return { isValid: true }
}
