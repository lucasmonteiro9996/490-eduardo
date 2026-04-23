import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import styles from './AdminLoginPage.module.css'

export default function AdminLoginPage() {
  const { isAdmin, login } = useAdminAuth()
  const navigate = useNavigate()

  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [shake, setShake] = useState(false)

  if (isAdmin) {
    return <Navigate to="/admin/inbox" replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('admin_email') || '').trim()
    const password = String(fd.get('admin_pass') || '')

    setError('')
    setPending(true)

    // Pequeno delay para parecer que está validando
    await new Promise((r) => setTimeout(r, 520))

    const result = login(email, password)
    setPending(false)

    if (result.ok) {
      navigate('/admin/inbox', { replace: true })
    } else {
      setError(result.error)
      setShake(true)
      setTimeout(() => setShake(false), 600)
    }
  }

  return (
    <div className={styles.bg}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <main className={`${styles.card} ${shake ? styles.shake : ''}`}>

        {/* Logo */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <img
              src="/branding/logo-sem-fundo.png"
              alt="Ocean Capital"
              className={styles.logoMark}
            />
            <img
              src="/branding/logo-escritos-sem-fundo.png"
              alt="Ocean Capital"
              className={styles.logoImage}
            />
          </div>

          <div className={styles.restrictedBadge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Acesso Restrito — Área Administrativa
          </div>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">

          <div className={styles.group}>
            <label htmlFor="admin_email">E-mail do administrador</label>
            <div className={`${styles.field} corner-box`}>
              <span className={styles.fieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                id="admin_email"
                name="admin_email"
                type="email"
                placeholder="siteocn@gmail.com"
                autoComplete="off"
                required
              />
            </div>
          </div>

          <div className={styles.group}>
            <label htmlFor="admin_pass">Senha de acesso</label>
            <div className={`${styles.field} corner-box`}>
              <span className={styles.fieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="admin_pass"
                name="admin_pass"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="off"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            className={`${styles.btn} corner-box`}
            type="submit"
            disabled={pending}
          >
            {pending ? (
              <span className={styles.btnLoading}>
                <span className={styles.spinner} />
                Verificando credenciais...
              </span>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                </svg>
                ACESSAR PAINEL ADMIN
              </>
            )}
          </button>
        </form>

        {/* Hint de dev */}
        <div className={styles.devHint}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Demo: <code>siteocn@gmail.com</code> / <code>admin@2024</code>
        </div>

        <div className={styles.footer}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Sessão criptografada · Acesso monitorado
        </div>
      </main>
    </div>
  )
}
