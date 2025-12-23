import { doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Staff } from '@/types/staff';

/**
 * 職員データを Firestore に保存
 * @param staffId 職員ID
 * @param data 職員データ
 */
export async function createStaff(
  staffId: string,
  data: Omit<Staff, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const staffRef = doc(db, 'staff', staffId);

  await setDoc(staffRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * 職員データを取得
 * @param staffId 職員ID
 * @returns 職員データ、存在しない場合は null
 */
export async function getStaff(staffId: string): Promise<Staff | null> {
  const staffRef = doc(db, 'staff', staffId);
  const staffSnap = await getDoc(staffRef);

  if (!staffSnap.exists()) {
    return null;
  }

  return staffSnap.data() as Staff;
}

/**
 * 職員データを更新
 * @param staffId 職員ID
 * @param data 更新するデータ
 */
export async function updateStaff(
  staffId: string,
  data: Partial<Omit<Staff, 'createdAt' | 'updatedAt' | 'createdBy'>>
): Promise<void> {
  const staffRef = doc(db, 'staff', staffId);

  await updateDoc(staffRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * 組織の職員一覧を取得
 * @param organizationId 組織ID
 * @returns 職員データの配列
 */
export async function getStaffByOrganization(
  organizationId: string
): Promise<Staff[]> {
  const staffCollection = collection(db, 'staff');
  const q = query(staffCollection, where('organizationId', '==', organizationId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => doc.data() as Staff);
}

/**
 * 在職中の職員一覧を取得
 * @param organizationId 組織ID
 * @returns 在職中の職員データの配列
 */
export async function getActiveStaff(
  organizationId: string
): Promise<Staff[]> {
  const staffCollection = collection(db, 'staff');
  const q = query(
    staffCollection,
    where('organizationId', '==', organizationId),
    where('isActive', '==', true)
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map(doc => doc.data() as Staff);
}

/**
 * 職員を退職状態にする
 * @param staffId 職員ID
 * @param retireDate 退職日
 * @param updatedBy 更新者
 */
export async function retireStaff(
  staffId: string,
  retireDate: string,
  updatedBy: string
): Promise<void> {
  await updateStaff(staffId, {
    isActive: false,
    retireDate,
    updatedBy,
  });
}
