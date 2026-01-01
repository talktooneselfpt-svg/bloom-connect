"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth, db, getCollectionName } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { Staff } from '@/types/staff'
import { Organization } from '@/types/organization'

interface AuthContextType {
  user: User | null
  staff: Staff | null
  organization: Organization | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  staff: null,
  organization: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [staff, setStaff] = useState<Staff | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        // スタッフ情報を取得
        try {
          const staffRef = doc(db, getCollectionName('staff'), firebaseUser.uid)
          const staffSnap = await getDoc(staffRef)

          if (staffSnap.exists()) {
            const staffData = staffSnap.data() as Staff
            setStaff(staffData)

            // 組織情報を取得
            if (staffData.organizationId) {
              const orgRef = doc(db, getCollectionName('organizations'), staffData.organizationId)
              const orgSnap = await getDoc(orgRef)

              if (orgSnap.exists()) {
                setOrganization({
                  id: orgSnap.id,
                  ...orgSnap.data()
                } as Organization)
              }
            }
          }
        } catch (error) {
          console.error('Error loading user data:', error)
        }
      } else {
        setStaff(null)
        setOrganization(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleSignOut = async () => {
    try {
      await auth.signOut()
      setUser(null)
      setStaff(null)
      setOrganization(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        staff,
        organization,
        loading,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
