"use client"

import { AuthProvider } from '@/contexts/AuthContext'
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext'
import { useAuth } from '@/contexts/AuthContext'
import { ReactNode } from 'react'

function FeatureFlagWrapper({ children }: { children: ReactNode }) {
  const { user, isDeveloper } = useAuth()

  return (
    <FeatureFlagProvider
      isDeveloper={isDeveloper}
      organizationId={user?.organizationId}
    >
      {children}
    </FeatureFlagProvider>
  )
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <FeatureFlagWrapper>
        {children}
      </FeatureFlagWrapper>
    </AuthProvider>
  )
}
