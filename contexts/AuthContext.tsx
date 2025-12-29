"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'developer' | 'parent-device' | 'child-device'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  organizationId?: string
}

interface AuthContextType {
  user: User | null
  isDeveloper: boolean
  isParentDevice: boolean
  isChildDevice: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchToDeveloperMode: () => void
  switchToUserMode: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // ローカルストレージからユーザー情報を復元
    const stored = localStorage.getItem('auth-user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('auth-user')
      }
    } else {
      // デフォルト: 開発者モード（デモ用）
      setUser({
        id: 'dev-001',
        name: '開発者',
        email: 'developer@bloom-connect.com',
        role: 'developer'
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    // TODO: 実際の認証APIを実装
    // デモ用の簡易認証
    if (email === 'developer@bloom-connect.com') {
      const devUser: User = {
        id: 'dev-001',
        name: '開発者',
        email,
        role: 'developer'
      }
      setUser(devUser)
      localStorage.setItem('auth-user', JSON.stringify(devUser))
    } else if (email.includes('@')) {
      // エンドユーザーとしてログイン
      const endUser: User = {
        id: 'user-001',
        name: 'テストユーザー',
        email,
        role: 'parent-device',
        organizationId: 'org-001'
      }
      setUser(endUser)
      localStorage.setItem('auth-user', JSON.stringify(endUser))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth-user')
  }

  const switchToDeveloperMode = () => {
    const devUser: User = {
      id: 'dev-001',
      name: '開発者',
      email: 'developer@bloom-connect.com',
      role: 'developer'
    }
    setUser(devUser)
    localStorage.setItem('auth-user', JSON.stringify(devUser))
  }

  const switchToUserMode = () => {
    const endUser: User = {
      id: 'user-001',
      name: 'テストユーザー',
      email: 'test@example.com',
      role: 'parent-device',
      organizationId: 'org-001'
    }
    setUser(endUser)
    localStorage.setItem('auth-user', JSON.stringify(endUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isDeveloper: user?.role === 'developer',
        isParentDevice: user?.role === 'parent-device',
        isChildDevice: user?.role === 'child-device',
        login,
        logout,
        switchToDeveloperMode,
        switchToUserMode
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
