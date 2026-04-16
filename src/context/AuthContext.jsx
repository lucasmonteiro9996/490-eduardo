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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

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
    async login(email, password) {
      if (!auth) {
        throw new Error('Firebase nao configurado. Preencha as variaveis VITE_FIREBASE_*.')
      }

      const credential = await signInWithEmailAndPassword(auth, email, password)
      return credential.user
    },
    async register({ name, email, password, cpf }) {
      if (!auth) {
        throw new Error('Firebase nao configurado. Preencha as variaveis VITE_FIREBASE_*.')
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
      if (!auth) {
        setUser(null)
        return
      }

      await signOut(auth)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
