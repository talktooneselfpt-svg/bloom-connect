/**
 * 保存済み検索条件のFirestore操作
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  SavedSearch,
  SearchResourceType,
  CreateSavedSearchInput,
  UpdateSavedSearchInput,
} from '@/types/saved-search'

const SAVED_SEARCHES_COLLECTION = 'savedSearches'

/**
 * 保存済み検索条件を作成
 */
export async function createSavedSearch(
  userId: string,
  input: CreateSavedSearchInput
): Promise<string> {
  try {
    const savedSearch: Omit<SavedSearch, 'id'> = {
      userId,
      resourceType: input.resourceType,
      name: input.name,
      description: input.description,
      filters: input.filters,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
      isDefault: input.isDefault || false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, SAVED_SEARCHES_COLLECTION), savedSearch)
    return docRef.id
  } catch (error) {
    console.error('検索条件の保存に失敗しました:', error)
    throw error
  }
}

/**
 * ユーザーの保存済み検索条件を取得
 */
export async function getUserSavedSearches(
  userId: string,
  resourceType?: SearchResourceType
): Promise<SavedSearch[]> {
  try {
    const constraints = [
      where('userId', '==', userId),
      orderBy('lastUsedAt', 'desc'),
      orderBy('createdAt', 'desc'),
    ]

    if (resourceType) {
      constraints.splice(1, 0, where('resourceType', '==', resourceType))
    }

    const q = query(collection(db, SAVED_SEARCHES_COLLECTION), ...constraints)
    const querySnapshot = await getDocs(q)

    const searches: SavedSearch[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as SavedSearch[]

    return searches
  } catch (error) {
    console.error('保存済み検索条件の取得に失敗しました:', error)
    throw error
  }
}

/**
 * デフォルトの検索条件を取得
 */
export async function getDefaultSavedSearch(
  userId: string,
  resourceType: SearchResourceType
): Promise<SavedSearch | null> {
  try {
    const q = query(
      collection(db, SAVED_SEARCHES_COLLECTION),
      where('userId', '==', userId),
      where('resourceType', '==', resourceType),
      where('isDefault', '==', true)
    )

    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as SavedSearch
  } catch (error) {
    console.error('デフォルト検索条件の取得に失敗しました:', error)
    return null
  }
}

/**
 * 保存済み検索条件を更新
 */
export async function updateSavedSearch(
  searchId: string,
  input: UpdateSavedSearchInput
): Promise<void> {
  try {
    const searchRef = doc(db, SAVED_SEARCHES_COLLECTION, searchId)
    await updateDoc(searchRef, {
      ...input,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('検索条件の更新に失敗しました:', error)
    throw error
  }
}

/**
 * 検索条件の使用日時を更新
 */
export async function updateLastUsedAt(searchId: string): Promise<void> {
  try {
    const searchRef = doc(db, SAVED_SEARCHES_COLLECTION, searchId)
    await updateDoc(searchRef, {
      lastUsedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('使用日時の更新に失敗しました:', error)
    throw error
  }
}

/**
 * デフォルトの検索条件を設定
 */
export async function setDefaultSavedSearch(
  userId: string,
  searchId: string,
  resourceType: SearchResourceType
): Promise<void> {
  try {
    // 同じリソースタイプの他のデフォルトを解除
    const q = query(
      collection(db, SAVED_SEARCHES_COLLECTION),
      where('userId', '==', userId),
      where('resourceType', '==', resourceType),
      where('isDefault', '==', true)
    )

    const querySnapshot = await getDocs(q)
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, { isDefault: false, updatedAt: Timestamp.now() })
    )

    await Promise.all(updatePromises)

    // 新しいデフォルトを設定
    const searchRef = doc(db, SAVED_SEARCHES_COLLECTION, searchId)
    await updateDoc(searchRef, {
      isDefault: true,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('デフォルト設定に失敗しました:', error)
    throw error
  }
}

/**
 * 保存済み検索条件を削除
 */
export async function deleteSavedSearch(searchId: string): Promise<void> {
  try {
    const searchRef = doc(db, SAVED_SEARCHES_COLLECTION, searchId)
    await deleteDoc(searchRef)
  } catch (error) {
    console.error('検索条件の削除に失敗しました:', error)
    throw error
  }
}
