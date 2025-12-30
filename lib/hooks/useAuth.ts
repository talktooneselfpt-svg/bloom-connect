'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getStaff } from '@/lib/firestore/staff';
import { UserRole, stringToRole } from '@/lib/auth/rbac';
import type { Staff } from '@/types/staff';

export interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole;
  staff: Staff | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * 認証状態とユーザーロールを管理するフック
 */
export function useAuth(): AuthUser {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [role, setRole] = useState<UserRole>(UserRole.GENERAL);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Firebase Authの認証状態を監視
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          // Firestoreからスタッフ情報を取得
          const staffData = await getStaff(firebaseUser.uid);

          if (staffData) {
            setStaff(staffData);

            // スタッフのロールを取得
            const userRole = stringToRole(staffData.role);
            setRole(userRole || UserRole.GENERAL);
          } else {
            // スタッフ情報がない場合はデフォルトロール
            setRole(UserRole.GENERAL);
          }
        } catch (error) {
          console.error('スタッフ情報の取得に失敗:', error);
          setRole(UserRole.GENERAL);
        }
      } else {
        // ログアウト状態
        setUser(null);
        setStaff(null);
        setRole(UserRole.GENERAL);
      }

      setIsLoading(false);
    });

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  return {
    uid: user?.uid || '',
    email: user?.email || null,
    role,
    staff,
    isAuthenticated: !!user,
    isLoading,
  };
}

/**
 * 開発者モードかどうかを判定するフック
 */
export function useIsDeveloper(): boolean {
  const { role } = useAuth();
  return role === UserRole.DEVELOPER;
}

/**
 * 管理者かどうかを判定するフック
 */
export function useIsAdmin(): boolean {
  const { role } = useAuth();
  return role === UserRole.ADMIN;
}
