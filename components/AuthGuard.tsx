'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

/**
 * AuthGuardのProps
 */
interface AuthGuardProps {
  /** 保護するコンテンツ */
  children: ReactNode;
  /** ログインページを除外するかどうか（デフォルト: false） */
  requireAuth?: boolean;
}

/**
 * 認証ガードコンポーネント
 *
 * 認証が必要なページを保護し、未認証の場合はログインページにリダイレクトします。
 *
 * 使用例:
 * ```tsx
 * <AuthGuard requireAuth={true}>
 *   <ProtectedPage />
 * </AuthGuard>
 * ```
 */
export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { isAuthenticated, loading, user, staff } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 認証が不要なページはスキップ
    if (!requireAuth) {
      return;
    }

    // ローディング中は何もしない
    if (loading) {
      return;
    }

    // 認証されていない場合、ログインページにリダイレクト
    if (!isAuthenticated) {
      // 現在のパスを保存して、ログイン後に元のページに戻れるようにする
      const returnUrl = pathname !== '/auth/login' ? pathname : '/';
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
      return;
    }

    // パスワード未設定の場合、パスワード設定ページにリダイレクト
    if (user && staff && !staff.passwordSetupCompleted && pathname !== '/auth/setup-password') {
      router.push('/auth/setup-password');
      return;
    }
  }, [isAuthenticated, loading, user, staff, router, pathname, requireAuth]);

  // ローディング中はローディング画面を表示
  if (requireAuth && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  // 認証が不要、または認証済みの場合はコンテンツを表示
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // それ以外の場合（リダイレクト中）は空を表示
  return null;
}
