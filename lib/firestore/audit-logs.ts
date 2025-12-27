/**
 * 監査ログのFirestore操作
 */

import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  AuditLog,
  CreateAuditLogInput,
  AuditLogFilter,
  AuditLogStats,
  AuditAction,
  ResourceType,
} from '@/types/audit-log'

const AUDIT_LOGS_COLLECTION = 'auditLogs'

/**
 * 監査ログを作成
 */
export async function createAuditLog(
  input: CreateAuditLogInput,
  ipAddress: string = 'unknown',
  userAgent: string = 'unknown'
): Promise<string> {
  try {
    const auditLog: Omit<AuditLog, 'id'> = {
      userId: input.userId,
      userName: input.userName,
      organizationId: input.organizationId,
      action: input.action,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      resourceName: input.resourceName,
      changes: input.changes,
      ipAddress,
      userAgent,
      timestamp: Timestamp.now(),
      metadata: input.metadata,
    }

    const docRef = await addDoc(collection(db, AUDIT_LOGS_COLLECTION), auditLog)
    return docRef.id
  } catch (error) {
    console.error('監査ログの作成に失敗しました:', error)
    throw error
  }
}

/**
 * 組織の監査ログを取得（フィルター対応）
 */
export async function getAuditLogs(
  organizationId: string,
  filter?: AuditLogFilter,
  maxResults: number = 100
): Promise<AuditLog[]> {
  try {
    const constraints: QueryConstraint[] = [
      where('organizationId', '==', organizationId),
      orderBy('timestamp', 'desc'),
      limit(maxResults),
    ]

    // フィルター条件を追加
    if (filter?.userId) {
      constraints.push(where('userId', '==', filter.userId))
    }

    if (filter?.action) {
      constraints.push(where('action', '==', filter.action))
    }

    if (filter?.resourceType) {
      constraints.push(where('resourceType', '==', filter.resourceType))
    }

    if (filter?.startDate) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(filter.startDate)))
    }

    if (filter?.endDate) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(filter.endDate)))
    }

    const q = query(collection(db, AUDIT_LOGS_COLLECTION), ...constraints)
    const querySnapshot = await getDocs(q)

    let logs: AuditLog[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditLog[]

    // 検索クエリでフィルター（クライアント側）
    if (filter?.searchQuery) {
      const searchLower = filter.searchQuery.toLowerCase()
      logs = logs.filter(
        (log) =>
          log.userName.toLowerCase().includes(searchLower) ||
          log.resourceName?.toLowerCase().includes(searchLower) ||
          log.resourceId.toLowerCase().includes(searchLower)
      )
    }

    return logs
  } catch (error) {
    console.error('監査ログの取得に失敗しました:', error)
    throw error
  }
}

/**
 * ユーザーの最近の監査ログを取得
 */
export async function getUserRecentLogs(
  userId: string,
  maxResults: number = 20
): Promise<AuditLog[]> {
  try {
    const q = query(
      collection(db, AUDIT_LOGS_COLLECTION),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    )

    const querySnapshot = await getDocs(q)

    const logs: AuditLog[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditLog[]

    return logs
  } catch (error) {
    console.error('ユーザーの監査ログの取得に失敗しました:', error)
    throw error
  }
}

/**
 * 監査ログの統計情報を計算
 */
export async function calculateAuditLogStats(
  organizationId: string,
  dateRange?: { startDate: Date; endDate: Date }
): Promise<AuditLogStats> {
  try {
    const constraints: QueryConstraint[] = [where('organizationId', '==', organizationId)]

    if (dateRange?.startDate) {
      constraints.push(where('timestamp', '>=', Timestamp.fromDate(dateRange.startDate)))
    }

    if (dateRange?.endDate) {
      constraints.push(where('timestamp', '<=', Timestamp.fromDate(dateRange.endDate)))
    }

    const q = query(collection(db, AUDIT_LOGS_COLLECTION), ...constraints)
    const querySnapshot = await getDocs(q)

    const logs: AuditLog[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as AuditLog[]

    // アクション別の集計
    const logsByAction: Record<AuditAction, number> = {
      create: 0,
      update: 0,
      delete: 0,
      login: 0,
      logout: 0,
      view: 0,
      export: 0,
    }

    // リソースタイプ別の集計
    const logsByResourceType: Record<ResourceType, number> = {
      staff: 0,
      client: 0,
      organization: 0,
      subscription: 0,
      device: 0,
      notification: 0,
      plan: 0,
      settings: 0,
    }

    // ユーザー別の集計
    const userCounts: Record<string, { userName: string; count: number }> = {}

    logs.forEach((log) => {
      logsByAction[log.action] = (logsByAction[log.action] || 0) + 1
      logsByResourceType[log.resourceType] = (logsByResourceType[log.resourceType] || 0) + 1

      if (!userCounts[log.userId]) {
        userCounts[log.userId] = { userName: log.userName, count: 0 }
      }
      userCounts[log.userId].count += 1
    })

    // 最もアクティブなユーザーを特定
    let mostActiveUser: { userId: string; userName: string; count: number } | null = null
    Object.entries(userCounts).forEach(([userId, data]) => {
      if (!mostActiveUser || data.count > mostActiveUser.count) {
        mostActiveUser = { userId, userName: data.userName, count: data.count }
      }
    })

    return {
      totalLogs: logs.length,
      logsByAction,
      logsByResourceType,
      uniqueUsers: Object.keys(userCounts).length,
      mostActiveUser,
    }
  } catch (error) {
    console.error('監査ログの統計計算に失敗しました:', error)
    throw error
  }
}

/**
 * 監査ログをエクスポート用に整形
 */
export function formatAuditLogsForExport(logs: AuditLog[]): Array<Record<string, any>> {
  return logs.map((log) => ({
    '日時': log.timestamp.toDate().toLocaleString('ja-JP'),
    '操作者': log.userName,
    'アクション': log.action,
    'リソース種別': log.resourceType,
    'リソース名': log.resourceName || log.resourceId,
    'IPアドレス': log.ipAddress,
    '変更内容': log.changes
      ? `変更前: ${JSON.stringify(log.changes.before)} → 変更後: ${JSON.stringify(log.changes.after)}`
      : '',
  }))
}
