'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Staff } from '@/types/staff';
import { Organization } from '@/types/organization';

/**
 * 認証コンテキストの型定義
 */
interface AuthContextType {
  /** Firebase認証ユーザー */
  user: User | null;
  /** 職員情報 */
  staff: Staff | null;
  /** 組織情報 */
  organization: Organization | null;
  /** 読み込み中フラグ */
  loading: boolean;
  /** 認証済みかどうか */
  isAuthenticated: boolean;
  /** ログアウト関数 */
  signOut: () => Promise<void>;
  /** 認証情報を再読み込み */
  refreshAuth: () => Promise<void>;
}

// デフォルト値を持つコンテキストを作成
const AuthContext = createContext<AuthContextType>({
  user: null,
  staff: null,
  organization: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshAuth: async () => {},
});

/**
 * AuthContextを使用するためのカスタムフック
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * 認証プロバイダーのProps
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 認証プロバイダーコンポーネント
 *
 * アプリ全体の認証状態を管理し、子コンポーネントに認証情報を提供します。
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * 職員情報と組織情報を読み込む
   */
  const loadUserData = async (firebaseUser: User) => {
    try {
      // 職員情報を取得
      const staffDoc = await getDoc(doc(db, 'staff', firebaseUser.uid));

      if (!staffDoc.exists()) {
        console.error('職員情報が見つかりません');
        setStaff(null);
        setOrganization(null);
        return;
      }

      const staffData = staffDoc.data() as Staff;
      setStaff(staffData);

      // 組織情報を取得
      if (staffData.organizationId) {
        const orgDoc = await getDoc(doc(db, 'organizations', staffData.organizationId));

        if (orgDoc.exists()) {
          setOrganization({ id: orgDoc.id, ...orgDoc.data() } as Organization);
        } else {
          console.error('組織情報が見つかりません');
          setOrganization(null);
        }
      }
    } catch (error) {
      console.error('ユーザーデータの読み込みエラー:', error);
      setStaff(null);
      setOrganization(null);
    }
  };

  /**
   * 認証情報を再読み込み
   */
  const refreshAuth = async () => {
    if (user) {
      await loadUserData(user);
    }
  };

  /**
   * ログアウト処理
   */
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setStaff(null);
      setOrganization(null);
    } catch (error) {
      console.error('ログアウトエラー:', error);
      throw error;
    }
  };

  /**
   * Firebase認証状態の監視
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        setUser(firebaseUser);
        await loadUserData(firebaseUser);
      } else {
        setUser(null);
        setStaff(null);
        setOrganization(null);
      }

      setLoading(false);
    });

    // クリーンアップ関数
    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    staff,
    organization,
    loading,
    isAuthenticated: !!user && !!staff,
    signOut,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
