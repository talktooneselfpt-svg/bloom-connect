"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"
import { AuthProvider } from "@/contexts/AuthContext"
import { AuthGuard } from "@/components/AuthGuard"

// ナビゲーションを動的にインポート（初期ロードを高速化）
const Navigation = dynamic(() => import("@/components/Navigation"), {
  ssr: true,
  loading: () => <div className="h-16 bg-white border-b border-gray-200" />
})

export function ConditionalNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')
  const isAuthRoute = pathname?.startsWith('/auth') || pathname?.startsWith('/setup')

  return (
    <AuthProvider>
      <AuthGuard>
        {isAdminRoute || isAuthRoute ? (
          // 管理画面または認証画面では独自のレイアウトを使用
          <>{children}</>
        ) : (
          // エンドユーザー画面では通常のNavigationを表示
          <>
            <Navigation />
            <div className="lg:ml-64">
              {children}
            </div>
          </>
        )}
      </AuthGuard>
    </AuthProvider>
  )
}
