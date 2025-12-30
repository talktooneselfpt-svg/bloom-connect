'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { canAccessPath } from '@/lib/auth/rbac';

interface RouteGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ページアクセス権限を保護するコンポーネント
 */
export default function RouteGuard({ children, fallback }: RouteGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { role, isAuthenticated, isLoading, staff } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // 未認証の場合はログインページへ
    if (!isAuthenticated) {
      // 公開ページはアクセス許可
      const publicPaths = ['/', '/auth/login', '/terms', '/contact', '/setup'];
      if (!publicPaths.includes(pathname) && !pathname.startsWith('/auth')) {
        router.push('/auth/login');
      }
      return;
    }

    // 初回ログイン時のパスワード変更チェック
    if (staff && !staff.passwordSetupCompleted && pathname !== '/auth/change-password') {
      console.log('初回ログイン: パスワード変更ページへリダイレクト');
      router.push('/auth/change-password');
      return;
    }

    // ロールベースのアクセス制御
    if (!canAccessPath(role, pathname)) {
      console.warn(`アクセス拒否: ${pathname} (ロール: ${role})`);
      router.push('/home'); // 権限がない場合はホームへリダイレクト
    }
  }, [isAuthenticated, isLoading, role, staff, pathname, router]);

  // ローディング中
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </div>
      )
    );
  }

  // 認証済みかつアクセス権限がある場合のみコンテンツを表示
  if (isAuthenticated && canAccessPath(role, pathname)) {
    return <>{children}</>;
  }

  // それ以外はfallbackまたは空
  return fallback || null;
}
