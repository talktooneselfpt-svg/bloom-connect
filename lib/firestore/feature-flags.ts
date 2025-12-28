/**
 * 機能フラグ（Feature Flags）のFirestore操作
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
  FeatureFlag,
  FeatureStage,
  CreateFeatureFlagInput,
  FeatureFlagHistory,
} from '@/types/feature-flag'

const FEATURE_FLAGS_COLLECTION = 'featureFlags'
const FEATURE_FLAG_HISTORY_COLLECTION = 'featureFlagHistory'

/**
 * 機能フラグを作成
 */
export async function createFeatureFlag(
  input: CreateFeatureFlagInput,
  createdBy: string
): Promise<string> {
  try {
    const featureFlag: Omit<FeatureFlag, 'id'> = {
      key: input.key,
      name: input.name,
      description: input.description,
      stage: input.stage || 'development',
      enabledForOrganizations: input.enabledForOrganizations,
      enabledForUsers: input.enabledForUsers,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy,
      lastModifiedBy: createdBy,
      metadata: input.metadata,
    }

    const docRef = await addDoc(collection(db, FEATURE_FLAGS_COLLECTION), featureFlag)

    // 履歴を記録
    await addFeatureFlagHistory({
      featureFlagId: docRef.id,
      action: 'created',
      newStage: featureFlag.stage,
      userId: createdBy,
      userName: '開発者', // TODO: 実際のユーザー名を取得
    })

    return docRef.id
  } catch (error) {
    console.error('機能フラグの作成に失敗しました:', error)
    throw error
  }
}

/**
 * すべての機能フラグを取得
 */
export async function getAllFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const q = query(collection(db, FEATURE_FLAGS_COLLECTION), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    const flags: FeatureFlag[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FeatureFlag[]

    return flags
  } catch (error) {
    console.error('機能フラグの取得に失敗しました:', error)
    throw error
  }
}

/**
 * 機能フラグをキーで取得
 */
export async function getFeatureFlagByKey(key: string): Promise<FeatureFlag | null> {
  try {
    const q = query(collection(db, FEATURE_FLAGS_COLLECTION), where('key', '==', key))
    const querySnapshot = await getDocs(q)

    if (querySnapshot.empty) {
      return null
    }

    const doc = querySnapshot.docs[0]
    return {
      id: doc.id,
      ...doc.data(),
    } as FeatureFlag
  } catch (error) {
    console.error('機能フラグの取得に失敗しました:', error)
    return null
  }
}

/**
 * 機能が有効かチェック
 */
export async function isFeatureEnabled(
  key: string,
  userRole: string,
  organizationId?: string,
  userId?: string
): Promise<boolean> {
  try {
    const flag = await getFeatureFlagByKey(key)

    if (!flag) {
      // 機能フラグが存在しない場合はデフォルトで有効
      return true
    }

    // 無効化されている場合
    if (flag.stage === 'disabled') {
      return false
    }

    // 本番環境の場合は全ユーザーに公開
    if (flag.stage === 'production') {
      return true
    }

    // 開発中またはテスト中の場合は開発者のみ
    if (flag.stage === 'development' || flag.stage === 'staging') {
      if (userRole !== 'developer' && userRole !== 'admin') {
        return false
      }
    }

    // 特定の事業所のみ有効
    if (flag.enabledForOrganizations && flag.enabledForOrganizations.length > 0) {
      if (!organizationId || !flag.enabledForOrganizations.includes(organizationId)) {
        return false
      }
    }

    // 特定のユーザーのみ有効
    if (flag.enabledForUsers && flag.enabledForUsers.length > 0) {
      if (!userId || !flag.enabledForUsers.includes(userId)) {
        return false
      }
    }

    return true
  } catch (error) {
    console.error('機能フラグのチェックに失敗しました:', error)
    // エラー時はデフォルトで有効
    return true
  }
}

/**
 * 機能フラグのステージを変更
 */
export async function updateFeatureFlagStage(
  flagId: string,
  newStage: FeatureStage,
  userId: string,
  userName: string
): Promise<void> {
  try {
    const flagRef = doc(db, FEATURE_FLAGS_COLLECTION, flagId)
    const flagDoc = await getDoc(flagRef)

    if (!flagDoc.exists()) {
      throw new Error('機能フラグが見つかりません')
    }

    const currentFlag = flagDoc.data() as FeatureFlag
    const previousStage = currentFlag.stage

    await updateDoc(flagRef, {
      stage: newStage,
      updatedAt: Timestamp.now(),
      lastModifiedBy: userId,
    })

    // 履歴を記録
    await addFeatureFlagHistory({
      featureFlagId: flagId,
      action: 'stage_changed',
      previousStage,
      newStage,
      userId,
      userName,
    })
  } catch (error) {
    console.error('ステージの変更に失敗しました:', error)
    throw error
  }
}

/**
 * 機能フラグを削除
 */
export async function deleteFeatureFlag(flagId: string, userId: string, userName: string): Promise<void> {
  try {
    const flagRef = doc(db, FEATURE_FLAGS_COLLECTION, flagId)
    await deleteDoc(flagRef)

    // 履歴を記録
    await addFeatureFlagHistory({
      featureFlagId: flagId,
      action: 'deleted',
      userId,
      userName,
    })
  } catch (error) {
    console.error('機能フラグの削除に失敗しました:', error)
    throw error
  }
}

/**
 * 機能フラグの履歴を追加
 */
async function addFeatureFlagHistory(input: {
  featureFlagId: string
  action: FeatureFlagHistory['action']
  previousStage?: FeatureStage
  newStage?: FeatureStage
  userId: string
  userName: string
  metadata?: Record<string, any>
}): Promise<void> {
  try {
    const history: Omit<FeatureFlagHistory, 'id'> = {
      featureFlagId: input.featureFlagId,
      action: input.action,
      previousStage: input.previousStage,
      newStage: input.newStage,
      userId: input.userId,
      userName: input.userName,
      timestamp: Timestamp.now(),
      metadata: input.metadata,
    }

    await addDoc(collection(db, FEATURE_FLAG_HISTORY_COLLECTION), history)
  } catch (error) {
    console.error('履歴の記録に失敗しました:', error)
  }
}

/**
 * 機能フラグの履歴を取得
 */
export async function getFeatureFlagHistory(flagId: string): Promise<FeatureFlagHistory[]> {
  try {
    const q = query(
      collection(db, FEATURE_FLAG_HISTORY_COLLECTION),
      where('featureFlagId', '==', flagId),
      orderBy('timestamp', 'desc')
    )
    const querySnapshot = await getDocs(q)

    const history: FeatureFlagHistory[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as FeatureFlagHistory[]

    return history
  } catch (error) {
    console.error('履歴の取得に失敗しました:', error)
    return []
  }
}
