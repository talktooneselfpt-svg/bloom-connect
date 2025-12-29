"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { FeatureFlag, getFeatureFlags, isFeatureEnabled as checkFeatureEnabled } from '@/lib/featureFlags'

interface FeatureFlagContextType {
  flags: Record<string, FeatureFlag>
  isFeatureEnabled: (featureId: string) => boolean
  refreshFlags: () => void
  isDeveloper: boolean
  organizationId?: string
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined)

export function FeatureFlagProvider({
  children,
  isDeveloper = false,
  organizationId
}: {
  children: ReactNode
  isDeveloper?: boolean
  organizationId?: string
}) {
  const [flags, setFlags] = useState<Record<string, FeatureFlag>>({})

  const refreshFlags = () => {
    setFlags(getFeatureFlags())
  }

  useEffect(() => {
    refreshFlags()
  }, [])

  const isFeatureEnabled = (featureId: string) => {
    return checkFeatureEnabled(featureId, organizationId, isDeveloper)
  }

  return (
    <FeatureFlagContext.Provider value={{
      flags,
      isFeatureEnabled,
      refreshFlags,
      isDeveloper,
      organizationId
    }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext)
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return context
}

// 機能フラグでラップするコンポーネント
export function FeatureGate({
  featureId,
  children,
  fallback = null
}: {
  featureId: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const { isFeatureEnabled } = useFeatureFlags()

  if (!isFeatureEnabled(featureId)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
