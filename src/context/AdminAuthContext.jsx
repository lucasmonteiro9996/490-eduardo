import { createContext, useContext, useMemo, useState } from 'react'

// ── Credenciais do administrador (mock) ───────────────────────────────────
// Em produção isso viria de um backend seguro com JWT.
const ADMIN_CREDENTIALS = {
  email: 'siteocn@gmail.com',
  password: 'admin@2024',
}

const SESSION_KEY = 'oc_admin_session'

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

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => loadSession())

  const value = useMemo(() => ({
    admin,
    isAdmin: Boolean(admin),

    login(email, password) {
      if (
        email.trim().toLowerCase() === ADMIN_CREDENTIALS.email &&
        password === ADMIN_CREDENTIALS.password
      ) {
        const session = {
          email: ADMIN_CREDENTIALS.email,
          name: 'Administrador',
          loginAt: new Date().toISOString(),
        }
        saveSession(session)
        setAdmin(session)
        return { ok: true }
      }
      return { ok: false, error: 'Credenciais inválidas. Verifique e-mail e senha.' }
    },

    logout() {
      clearSession()
      setAdmin(null)
    },
  }), [admin])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth precisa estar dentro de AdminAuthProvider.')
  return ctx
}
