'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
}

// 認証不要なページのパス
const PUBLIC_PATHS = ['/auth/login', '/auth/setup-password', '/setup']

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return

    // 公開ページの場合は認証チェックをスキップ
    if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      return
    }

    // 未ログインの場合はログインページにリダイレクト
    if (!user) {
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

  // 公開ページまたはログイン済みの場合は子要素を表示
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path)) || user) {
    return <>{children}</>
  }

  // 上記のuseEffectでリダイレクトされるため、ここには到達しない
  return null
}
