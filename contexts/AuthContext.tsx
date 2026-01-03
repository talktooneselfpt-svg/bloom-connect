"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface CustomClaims {
  eid?: string  // establishment/organization ID
  role?: string
  plan?: string
  mustChangePassword?: boolean
}

interface AuthUser extends User {
  customClaims?: CustomClaims
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get custom claims from the ID token
          const idTokenResult = await firebaseUser.getIdTokenResult()
          const customClaims = idTokenResult.claims as CustomClaims

          // Enhance user object with custom claims
          const authUser: AuthUser = Object.assign(firebaseUser, {
            customClaims,
          })

          setUser(authUser)
        } catch (error) {
          console.error("Failed to get user claims:", error)
          setUser(firebaseUser as AuthUser)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
