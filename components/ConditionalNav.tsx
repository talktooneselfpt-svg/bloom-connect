"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// ナビゲーションを動的にインポート（初期ロードを高速化）
const Navigation = dynamic(() => import("@/components/Navigation"), {
  ssr: true,
  loading: () => <div className="h-16 bg-white border-b border-gray-200" />
})

export function ConditionalNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  if (isAdminRoute) {
    // 管理画面では独自のレイアウトを使用するため、Navigationを表示しない
    return <>{children}</>
  }

  // エンドユーザー画面では通常のNavigationを表示
  return (
    <>
      <Navigation />
      <div className="lg:ml-64">
        {children}
      </div>
    </>
  )
}
