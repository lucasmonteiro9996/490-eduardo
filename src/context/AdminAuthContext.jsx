import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth, hasFirebaseConfig } from '../lib/firebase.js'

const ADMIN_ALLOWLIST = ['siteocn@gmail.com']
const SESSION_KEY = 'oc_admin_session'

function isAdminEmail(email) {
  return ADMIN_ALLOWLIST.includes(String(email || '').trim().toLowerCase())
}

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(data) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
  } catch {}
}

function clearSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {}
}

function buildSession(email, displayName) {
  return {
    email,
    name: displayName || 'Administrador',
    loginAt: new Date().toISOString(),
  }
}

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => loadSession())
  const [loading, setLoading] = useState(Boolean(hasFirebaseConfig && auth))

  useEffect(() => {
    if (!hasFirebaseConfig || !auth) {
      setLoading(false)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser?.email && isAdminEmail(currentUser.email)) {
        const session = buildSession(currentUser.email, currentUser.displayName)
        saveSession(session)
        setAdmin(session)
      } else if (!currentUser) {
        clearSession()
        setAdmin(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = useMemo(() => ({
    admin,
    loading,
    isAdmin: Boolean(admin),

    async login(email, password) {
      const normalizedEmail = String(email || '').trim().toLowerCase()

      if (!isAdminEmail(normalizedEmail)) {
        return { ok: false, error: 'Este usuário não possui permissão para acessar o painel admin.' }
      }

      if (!hasFirebaseConfig || !auth) {
        return { ok: false, error: 'Painel admin indisponível: Firebase não configurado.' }
      }

      try {
        const credential = await signInWithEmailAndPassword(auth, normalizedEmail, password)

        if (!isAdminEmail(credential.user.email)) {
          await signOut(auth)
          return { ok: false, error: 'Este usuário não possui permissão para acessar o painel admin.' }
        }

        const session = buildSession(credential.user.email, credential.user.displayName)
        saveSession(session)
        setAdmin(session)
        return { ok: true }
      } catch (error) {
        const code = String(error?.code || '')
        if (!code.includes('auth/')) {
          return { ok: false, error: 'Não foi possível validar o acesso admin no Firebase agora.' }
        }

        return { ok: false, error: 'Credenciais inválidas. Verifique e-mail e senha.' }
      }
    },

    async logout() {
      clearSession()
      setAdmin(null)

      if (auth && isAdminEmail(auth.currentUser?.email)) {
        await signOut(auth)
      }
    },
  }), [admin, loading])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth precisa estar dentro de AdminAuthProvider.')
  return ctx
}
