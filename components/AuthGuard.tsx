"use client"

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return

    // ログインページ、セットアップページ、管理画面はガード対象外
    const isPublicRoute = pathname?.startsWith('/auth') || pathname?.startsWith('/setup') || pathname?.startsWith('/admin')

    if (!isPublicRoute && !user) {
      // 未認証の場合はログインページにリダイレクト
      router.push('/auth/login')
    }
  }, [user, loading, pathname, router])

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // 公開ルートまたは認証済みの場合は子要素を表示
  const isPublicRoute = pathname?.startsWith('/auth') || pathname?.startsWith('/setup') || pathname?.startsWith('/admin')
  if (isPublicRoute || user) {
    return <>{children}</>
  }

  // 未認証の場合は何も表示しない（リダイレクト待ち）
  return null
}
