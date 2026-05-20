import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, hasFirebaseConfig } from '../lib/firebase.js'
import { requestPasswordReset } from '../lib/passwordReset.js'

const AuthContext = createContext(null)
const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@oceancapital.local',
  displayName: 'Ocean Capital Demo',
}
const ALLOW_DEMO_MODE = !import.meta.env.PROD

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const [accountProfile, setAccountProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  useEffect(() => {
    if (!hasFirebaseConfig || !db || !user?.uid || demoMode) {
      setAccountProfile(null)
      setProfileLoading(false)
      return undefined
    }

    setProfileLoading(true)
    const profileRef = doc(db, 'users', user.uid)

    const unsubscribe = onSnapshot(
      profileRef,
      (snapshot) => {
        setAccountProfile(snapshot.exists() ? snapshot.data() : { status: 'active' })
        setProfileLoading(false)
      },
      () => {
        setAccountProfile({ status: 'active' })
        setProfileLoading(false)
      },
    )

    return unsubscribe
  }, [demoMode, user?.uid])

  const value = useMemo(() => ({
    user,
    loading,
    hasFirebaseConfig,
    demoMode,
    accountProfile,
    profileLoading,
    accountStatus: accountProfile?.status || (demoMode ? 'active' : null),
    async login(email, password) {
      if (!auth) {
        if (!hasFirebaseConfig && ALLOW_DEMO_MODE) {
          setDemoMode(true)
          setUser(DEMO_USER)
          return DEMO_USER
        }

        throw new Error('Firebase não configurado. Preencha as variáveis VITE_FIREBASE_*.')
      }

      const credential = await signInWithEmailAndPassword(auth, email, password)
      setDemoMode(false)
      return credential.user
    },
    async register({ name, email, password, cpf }) {
      if (!auth) {
        if (!hasFirebaseConfig && ALLOW_DEMO_MODE) {
          const mockUser = {
            ...DEMO_USER,
            email: email || DEMO_USER.email,
            displayName: name || DEMO_USER.displayName,
          }
          setDemoMode(true)
          setUser(mockUser)
          return mockUser
        }

        throw new Error('Firebase não configurado. Preencha as variáveis VITE_FIREBASE_*.')
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password)

      if (name) {
        await updateProfile(credential.user, { displayName: name })
      }

      if (db) {
        try {
          await setDoc(doc(db, 'users', credential.user.uid), {
            name,
            email,
            cpf,
            status: 'pending',
            rejectionReason: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true })
        } catch (error) {
          if (error?.code !== 'permission-denied' && error?.code !== 'firestore/permission-denied') {
            throw error
          }
        }
      }

      try {
        await sendEmailVerification(credential.user)
      } catch {
        // non-fatal — user can resend later
      }

      return credential.user
    },
    async resendVerification() {
      if (!auth?.currentUser) throw new Error('Usuário não autenticado.')
      await sendEmailVerification(auth.currentUser)
    },
    async resetPassword(email) {
      await requestPasswordReset(email)
    },
    async logout() {
      if (demoMode) {
        setDemoMode(false)
        setUser(null)
        return
      }

      if (!auth) {
        setUser(null)
        return
      }

      await signOut(auth)
    },
  }), [accountProfile, demoMode, loading, profileLoading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
