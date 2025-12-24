import { collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization } from '@/types/organization';
import { Staff } from '@/types/staff';
import { TrustedDevice } from '@/types/auth';

/**
 * 事業所番号から組織を取得
 */
export async function getOrganizationByCode(
  organizationCode: string
): Promise<Organization | null> {
  const organizationsRef = collection(db, 'organizations');
  const q = query(organizationsRef, where('organizationCode', '==', organizationCode));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Organization;
}

/**
 * 組織ID + 個人番号から職員を取得
 */
export async function getStaffByNumber(
  organizationId: string,
  staffNumber: string
): Promise<Staff | null> {
  const staffRef = collection(db, 'staff');
  const q = query(
    staffRef,
    where('organizationId', '==', organizationId),
    where('staffNumber', '==', staffNumber)
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return doc.data() as Staff;
}

/**
 * 信頼済みデバイスを登録
 */
export async function registerTrustedDevice(
  device: Omit<TrustedDevice, 'createdAt' | 'lastUsedAt'>
): Promise<void> {
  const deviceRef = doc(db, 'trustedDevices', device.id);

  await setDoc(deviceRef, {
    ...device,
    createdAt: serverTimestamp(),
    lastUsedAt: serverTimestamp(),
  });
}

/**
 * 信頼済みデバイスを取得
 */
export async function getTrustedDevice(
  deviceId: string
): Promise<TrustedDevice | null> {
  const deviceRef = doc(db, 'trustedDevices', deviceId);
  const deviceSnap = await getDoc(deviceRef);

  if (!deviceSnap.exists()) {
    return null;
  }

  return deviceSnap.data() as TrustedDevice;
}

/**
 * 信頼済みデバイスの最終使用日時を更新
 */
export async function updateDeviceLastUsed(deviceId: string): Promise<void> {
  const deviceRef = doc(db, 'trustedDevices', deviceId);

  await updateDoc(deviceRef, {
    lastUsedAt: serverTimestamp(),
  });
}

/**
 * デバイスのPINハッシュを更新
 */
export async function updateDevicePin(
  deviceId: string,
  pinHash: string
): Promise<void> {
  const deviceRef = doc(db, 'trustedDevices', deviceId);

  await updateDoc(deviceRef, {
    pinHash,
  });
}

/**
 * デバイスの生体認証設定を更新
 */
export async function updateDeviceBiometric(
  deviceId: string,
  credentialId: string
): Promise<void> {
  const deviceRef = doc(db, 'trustedDevices', deviceId);

  await updateDoc(deviceRef, {
    biometricEnabled: true,
    credentialId,
  });
}

/**
 * 職員のすべての信頼済みデバイスを取得
 */
export async function getStaffTrustedDevices(
  staffUid: string
): Promise<TrustedDevice[]> {
  const devicesRef = collection(db, 'trustedDevices');
  const q = query(devicesRef, where('staffUid', '==', staffUid));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => doc.data() as TrustedDevice);
}
