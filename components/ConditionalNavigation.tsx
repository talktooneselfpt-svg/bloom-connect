"use client"

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

export default function ConditionalNavigation() {
  const pathname = usePathname()

  // /dev で始まるパスでは表示しない
  if (pathname.startsWith('/dev')) {
    return null
  }

  return <Navigation />
}
