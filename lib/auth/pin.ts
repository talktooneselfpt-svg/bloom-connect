/**
 * PIN認証関連の関数
 * 信頼できるデバイスでPINログインを実現
 */

import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { hashPin, verifyPin, getOrCreateDeviceId } from "./device";

export interface TrustedDevice {
  uid: string;
  establishmentId: string;
  deviceId: string;
  deviceName: string;
  pinHash: string;
  createdAt: Timestamp;
  lastUsedAt: Timestamp;
  deviceFingerprint: string;
}

/**
 * 現在のデバイスが信頼できるデバイスとして登録されているかチェック
 */
export async function isTrustedDevice(uid: string): Promise<boolean> {
  try {
    const deviceId = getOrCreateDeviceId();
    const deviceRef = doc(db, "trustedDevices", deviceId);
    const deviceSnap = await getDoc(deviceRef);

    if (!deviceSnap.exists()) {
      return false;
    }

    const data = deviceSnap.data() as TrustedDevice;
    return data.uid === uid;
  } catch (error) {
    console.error("Failed to check trusted device:", error);
    return false;
  }
}

/**
 * 信頼できるデバイス情報を取得
 */
export async function getTrustedDevice(
  deviceId: string
): Promise<TrustedDevice | null> {
  try {
    const deviceRef = doc(db, "trustedDevices", deviceId);
    const deviceSnap = await getDoc(deviceRef);

    if (!deviceSnap.exists()) {
      return null;
    }

    return deviceSnap.data() as TrustedDevice;
  } catch (error) {
    console.error("Failed to get trusted device:", error);
    return null;
  }
}

/**
 * 現在のデバイスを信頼できるデバイスとして登録
 */
export async function registerTrustedDevice(
  pin: string,
  deviceName: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  // PIN検証（4〜6桁の数字）
  if (!/^\d{4,6}$/.test(pin)) {
    throw new Error("PINは4〜6桁の数字で入力してください");
  }

  try {
    const deviceId = getOrCreateDeviceId();
    const pinHash = await hashPin(pin);
    const tokenResult = await user.getIdTokenResult();
    const eid = tokenResult.claims.eid as string;

    const deviceData: Omit<TrustedDevice, "createdAt" | "lastUsedAt"> & {
      createdAt: any;
      lastUsedAt: any;
    } = {
      uid: user.uid,
      establishmentId: eid,
      deviceId,
      deviceName,
      pinHash,
      deviceFingerprint: navigator.userAgent,
      createdAt: serverTimestamp(),
      lastUsedAt: serverTimestamp(),
    };

    await setDoc(doc(db, "trustedDevices", deviceId), deviceData);
  } catch (error) {
    console.error("Failed to register trusted device:", error);
    throw error;
  }
}

/**
 * PINでログイン（信頼できるデバイスのみ）
 * @returns { success: boolean, staffId?: string, uid?: string }
 */
export async function loginWithPin(
  pin: string
): Promise<{ success: boolean; staffId?: string; uid?: string }> {
  try {
    const deviceId = getOrCreateDeviceId();
    const device = await getTrustedDevice(deviceId);

    if (!device) {
      return { success: false };
    }

    // PIN検証
    const isValid = await verifyPin(pin, device.pinHash);
    if (!isValid) {
      return { success: false };
    }

    // 最終使用日時を更新
    await updateDoc(doc(db, "trustedDevices", deviceId), {
      lastUsedAt: serverTimestamp(),
    });

    // usersコレクションからstaffIdを取得
    const userRef = doc(db, "users", device.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { success: false };
    }

    const userData = userSnap.data();
    return {
      success: true,
      staffId: userData.staffId,
      uid: device.uid,
    };
  } catch (error) {
    console.error("Failed to login with PIN:", error);
    return { success: false };
  }
}

/**
 * ユーザーの全ての信頼できるデバイスを取得
 */
export async function getUserTrustedDevices(
  uid: string
): Promise<TrustedDevice[]> {
  try {
    const q = query(
      collection(db, "trustedDevices"),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(q);

    const devices: TrustedDevice[] = [];
    querySnapshot.forEach((doc) => {
      devices.push(doc.data() as TrustedDevice);
    });

    return devices;
  } catch (error) {
    console.error("Failed to get user trusted devices:", error);
    return [];
  }
}

/**
 * 信頼できるデバイスを削除
 */
export async function removeTrustedDevice(deviceId: string): Promise<void> {
  try {
    const deviceRef = doc(db, "trustedDevices", deviceId);
    await updateDoc(deviceRef, {
      pinHash: "",
      lastUsedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to remove trusted device:", error);
    throw error;
  }
}

/**
 * PINを変更
 */
export async function changePinForDevice(
  deviceId: string,
  newPin: string
): Promise<void> {
  // PIN検証（4〜6桁の数字）
  if (!/^\d{4,6}$/.test(newPin)) {
    throw new Error("PINは4〜6桁の数字で入力してください");
  }

  try {
    const newPinHash = await hashPin(newPin);
    const deviceRef = doc(db, "trustedDevices", deviceId);
    await updateDoc(deviceRef, {
      pinHash: newPinHash,
      lastUsedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to change PIN:", error);
    throw error;
  }
}
