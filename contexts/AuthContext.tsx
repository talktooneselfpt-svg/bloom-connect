'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import { Staff } from '@/types/staff'

interface AuthContextType {
  user: User | null
  staffData: Staff | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  staffData: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staffData, setStaffData] = useState<Staff | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // ユーザーがログインしている場合、Firestoreから職員データを取得
        try {
          const staffDoc = await getDoc(doc(db, 'staff', user.uid))
          if (staffDoc.exists()) {
            setStaffData(staffDoc.data() as Staff)
          } else {
            setStaffData(null)
          }
        } catch (error) {
          console.error('職員データの取得に失敗しました:', error)
          setStaffData(null)
        }
      } else {
        setStaffData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      setUser(null)
      setStaffData(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, staffData, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
