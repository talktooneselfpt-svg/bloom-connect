import { doc, setDoc, serverTimestamp, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, getCollectionName } from '@/lib/firebase';
import { Staff } from '@/types/staff';
import { generateStaffNumber } from '@/lib/utils/idGenerator';

/**
 * 職員データを Firestore に保存
 * @param staffId 職員ID
 * @param data 職員データ
 */
export async function createStaff(
  staffId: string,
  data: Omit<Staff, 'createdAt' | 'updatedAt'>
): Promise<void> {
  const staffRef = doc(db, getCollectionName('staff'), staffId);

  // 職員番号が提供されていない場合は自動生成
  let staffNumber = data.staffNumber
  if (!staffNumber) {
    // 一意性を確保するまで生成を繰り返す
    let isUnique = false
    while (!isUnique) {
      staffNumber = generateStaffNumber()
      isUnique = await isStaffNumberAvailable(staffNumber, data.organizationId)
    }
  }

  await setDoc(staffRef, {
    ...data,
    staffNumber,
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
  const staffRef = doc(db, getCollectionName('staff'), staffId);
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
  const staffRef = doc(db, getCollectionName('staff'), staffId);

  await updateDoc(staffRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * すべての職員一覧を取得
 * @returns 職員データの配列
 */
export async function getAllStaff(): Promise<Staff[]> {
  const staffCollection = collection(db, getCollectionName('staff'));
  const querySnapshot = await getDocs(staffCollection);

  return querySnapshot.docs.map(doc => doc.data() as Staff);
}

/**
 * 組織の職員一覧を取得
 * @param organizationId 組織ID
 * @returns 職員データの配列
 */
export async function getStaffByOrganization(
  organizationId: string
): Promise<Staff[]> {
  const staffCollection = collection(db, getCollectionName('staff'));
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
  const staffCollection = collection(db, getCollectionName('staff'));
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

/**
 * 職員番号の重複チェック（組織内で一意性確認）
 * @param staffNumber チェックする職員番号
 * @param organizationId 組織ID
 * @returns 使用可能な場合true
 */
export async function isStaffNumberAvailable(
  staffNumber: string,
  organizationId: string
): Promise<boolean> {
  if (!db) return true // ビルド時は常にtrueを返す

  const staffCollection = collection(db, 'staff')
  const q = query(
    staffCollection,
    where('organizationId', '==', organizationId),
    where('staffNumber', '==', staffNumber)
  )
  const querySnapshot = await getDocs(q)

  return querySnapshot.empty
}
