import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, hasFirebaseConfig } from '../lib/firebase.js'

const AuthContext = createContext(null)
const DEMO_USER = {
  uid: 'demo-user',
  email: 'demo@oceancapital.local',
  displayName: 'Ocean Capital Demo',
}

function shouldUseDemoMode(error) {
  const code = String(error?.code || '').toLowerCase()
  const message = String(error?.message || '').toLowerCase()

  return (
    code.includes('permission-denied') ||
    code.includes('invalid-api-key') ||
    code.includes('api-key-not-valid') ||
    message.includes('has been suspended') ||
    message.includes('api key') ||
    message.includes('permission-denied')
  )
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

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

  const value = useMemo(() => ({
    user,
    loading,
    hasFirebaseConfig,
    demoMode,
    async login(email, password) {
      if (!auth) {
        throw new Error('Firebase não configurado. Preencha as variáveis VITE_FIREBASE_*.')
      }

      try {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        setDemoMode(false)
        return credential.user
      } catch (error) {
        if (shouldUseDemoMode(error)) {
          setDemoMode(true)
          setUser(DEMO_USER)
          return DEMO_USER
        }
        throw error
      }
    },
    async register({ name, email, password, cpf }) {
      if (!auth) {
        throw new Error('Firebase não configurado. Preencha as variáveis VITE_FIREBASE_*.')
      }

      let credential
      try {
        credential = await createUserWithEmailAndPassword(auth, email, password)
      } catch (error) {
        if (shouldUseDemoMode(error)) {
          const mockUser = {
            ...DEMO_USER,
            email: email || DEMO_USER.email,
            displayName: name || DEMO_USER.displayName,
          }
          setDemoMode(true)
          setUser(mockUser)
          return mockUser
        }
        throw error
      }

      if (name) {
        await updateProfile(credential.user, { displayName: name })
      }

      if (db) {
        try {
          await setDoc(doc(db, 'users', credential.user.uid), {
            name,
            email,
            cpf,
            createdAt: serverTimestamp(),
          }, { merge: true })
        } catch (error) {
          if (error?.code !== 'permission-denied' && error?.code !== 'firestore/permission-denied') {
            throw error
          }
        }
      }

      return credential.user
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
  }), [demoMode, loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
