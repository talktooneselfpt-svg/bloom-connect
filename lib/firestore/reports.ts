/**
 * レポート・統計データのFirestore操作
 */

import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * 組織の統計データ
 */
export interface OrganizationStats {
  // スタッフ統計
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;

  // クライアント統計
  totalClients: number;
  activeClients: number;
  inactiveClients: number;

  // 期間別登録数
  staffRegisteredThisMonth: number;
  clientsRegisteredThisMonth: number;
  staffRegisteredLastMonth: number;
  clientsRegisteredLastMonth: number;
}

/**
 * 期間別統計データ
 */
export interface PeriodStats {
  period: string; // 期間ラベル（例: "2024-01", "Week 1"）
  staffCount: number;
  clientCount: number;
  staffRegistrations: number;
  clientRegistrations: number;
}

/**
 * 組織の統計データを取得
 */
export async function getOrganizationStats(
  organizationId: string
): Promise<OrganizationStats> {
  try {
    // 現在の日付を取得
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // スタッフ統計
    const staffQuery = query(
      collection(db, 'staff'),
      where('organizationId', '==', organizationId)
    );
    const staffSnapshot = await getDocs(staffQuery);
    const staffList = staffSnapshot.docs.map(doc => doc.data());

    const totalStaff = staffList.length;
    const activeStaff = staffList.filter(s => s.isActive).length;
    const inactiveStaff = totalStaff - activeStaff;

    // 今月登録されたスタッフ
    const staffRegisteredThisMonth = staffList.filter(s => {
      const createdAt = s.createdAt;
      if (!createdAt) return false;
      const date = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return date >= thisMonthStart;
    }).length;

    // 先月登録されたスタッフ
    const staffRegisteredLastMonth = staffList.filter(s => {
      const createdAt = s.createdAt;
      if (!createdAt) return false;
      const date = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length;

    // クライアント統計
    const clientsQuery = query(
      collection(db, 'clients'),
      where('organizationId', '==', organizationId)
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    const clientsList = clientsSnapshot.docs.map(doc => doc.data());

    const totalClients = clientsList.length;
    const activeClients = clientsList.filter(c => c.isActive).length;
    const inactiveClients = totalClients - activeClients;

    // 今月登録されたクライアント
    const clientsRegisteredThisMonth = clientsList.filter(c => {
      const createdAt = c.createdAt;
      if (!createdAt) return false;
      const date = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return date >= thisMonthStart;
    }).length;

    // 先月登録されたクライアント
    const clientsRegisteredLastMonth = clientsList.filter(c => {
      const createdAt = c.createdAt;
      if (!createdAt) return false;
      const date = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return date >= lastMonthStart && date <= lastMonthEnd;
    }).length;

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      totalClients,
      activeClients,
      inactiveClients,
      staffRegisteredThisMonth,
      clientsRegisteredThisMonth,
      staffRegisteredLastMonth,
      clientsRegisteredLastMonth,
    };
  } catch (error) {
    console.error('統計データの取得に失敗:', error);
    throw error;
  }
}

/**
 * 週間統計を取得（過去7日間）
 */
export async function getWeeklyStats(
  organizationId: string
): Promise<PeriodStats[]> {
  const stats: PeriodStats[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    // スタッフ集計
    const staffQuery = query(
      collection(db, 'staff'),
      where('organizationId', '==', organizationId),
      where('createdAt', '>=', date.toISOString()),
      where('createdAt', '<', nextDate.toISOString())
    );
    const staffSnapshot = await getDocs(staffQuery);

    // クライアント集計
    const clientsQuery = query(
      collection(db, 'clients'),
      where('organizationId', '==', organizationId),
      where('createdAt', '>=', date.toISOString()),
      where('createdAt', '<', nextDate.toISOString())
    );
    const clientsSnapshot = await getDocs(clientsQuery);

    stats.push({
      period: `${date.getMonth() + 1}/${date.getDate()}`,
      staffCount: 0, // 累積カウントは別途計算が必要
      clientCount: 0,
      staffRegistrations: staffSnapshot.size,
      clientRegistrations: clientsSnapshot.size,
    });
  }

  return stats;
}

/**
 * 月間統計を取得（過去12ヶ月）
 */
export async function getMonthlyStats(
  organizationId: string
): Promise<PeriodStats[]> {
  const stats: PeriodStats[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

    // スタッフ集計
    const staffQuery = query(
      collection(db, 'staff'),
      where('organizationId', '==', organizationId)
    );
    const staffSnapshot = await getDocs(staffQuery);
    const staffInMonth = staffSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt;
      if (!createdAt) return false;
      const createdDate = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return createdDate >= date && createdDate < nextDate;
    });

    // クライアント集計
    const clientsQuery = query(
      collection(db, 'clients'),
      where('organizationId', '==', organizationId)
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    const clientsInMonth = clientsSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt;
      if (!createdAt) return false;
      const createdDate = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return createdDate >= date && createdDate < nextDate;
    });

    stats.push({
      period: `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`,
      staffCount: 0, // 累積カウントは別途計算が必要
      clientCount: 0,
      staffRegistrations: staffInMonth.length,
      clientRegistrations: clientsInMonth.length,
    });
  }

  return stats;
}

/**
 * 年間統計を取得（過去5年）
 */
export async function getYearlyStats(
  organizationId: string
): Promise<PeriodStats[]> {
  const stats: PeriodStats[] = [];
  const now = new Date();

  for (let i = 4; i >= 0; i--) {
    const year = now.getFullYear() - i;
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    // スタッフ集計
    const staffQuery = query(
      collection(db, 'staff'),
      where('organizationId', '==', organizationId)
    );
    const staffSnapshot = await getDocs(staffQuery);
    const staffInYear = staffSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt;
      if (!createdAt) return false;
      const createdDate = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return createdDate >= startDate && createdDate < endDate;
    });

    // クライアント集計
    const clientsQuery = query(
      collection(db, 'clients'),
      where('organizationId', '==', organizationId)
    );
    const clientsSnapshot = await getDocs(clientsQuery);
    const clientsInYear = clientsSnapshot.docs.filter(doc => {
      const createdAt = doc.data().createdAt;
      if (!createdAt) return false;
      const createdDate = typeof createdAt === 'string'
        ? new Date(createdAt)
        : createdAt.toDate();
      return createdDate >= startDate && createdDate < endDate;
    });

    stats.push({
      period: String(year),
      staffCount: 0, // 累積カウントは別途計算が必要
      clientCount: 0,
      staffRegistrations: staffInYear.length,
      clientRegistrations: clientsInYear.length,
    });
  }

  return stats;
}

/**
 * 前月比を計算
 */
export function calculateMonthOverMonthGrowth(
  current: number,
  previous: number
): { percentage: number; direction: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { percentage: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'neutral' };
  }

  const percentage = Math.round(((current - previous) / previous) * 100);

  return {
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
  };
}
