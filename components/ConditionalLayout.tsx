"use client"

import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export default function ConditionalLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  // /dev で始まるパスではマージンを適用しない（dev layoutが独自のレイアウトを持つため）
  if (pathname.startsWith('/dev')) {
    return <>{children}</>
  }

  // エンドユーザー画面では左マージンを適用
  return (
    <div className="lg:ml-64">
      {children}
    </div>
  )
}
