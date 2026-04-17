import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, register, hasFirebaseConfig } = useAuth()

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('senha') || '')
    const name = String(formData.get('name') || '').trim()
    const cpf = String(formData.get('cpf') || '').trim()
    const confirmPassword = String(formData.get('confirmSenha') || '')

    setErrorMessage('')

    if (tab === 'register' && password !== confirmPassword) {
      setErrorMessage('As senhas precisam ser iguais.')
      return
    }

    setPending(true)

    try {
      if (hasFirebaseConfig) {
        if (tab === 'login') {
          await login(email, password)
        } else {
          await register({ name, email, password, cpf })
        }
      }

      navigate(location.state?.from?.pathname || '/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(error?.message || 'Nao foi possivel autenticar agora.')
    } finally {
      setPending(false)
    }
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className={styles.bg}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <main className={`${styles.card} corner-box`}>
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <span className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#4a7fdb" strokeWidth="2" />
                <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="rgba(74,127,219,0.15)" stroke="#4a7fdb" strokeWidth="1.2" />
                <circle cx="14" cy="14" r="3" fill="#4a7fdb" />
              </svg>
            </span>
            <span className={styles.logoText}>DuoBank</span>
          </div>
          <p className={styles.subtitle}>Sua conta digital em Real e Dólar</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
            type="button"
          >
            <span className={styles.tabIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
              </svg>
            </span>
            Entrar
          </button>
          <button
            className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => setTab('register')}
            type="button"
          >
            <span className={styles.tabIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" />
                <line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </span>
            Criar Conta
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'register' ? (
            <div className={styles.group}>
              <label htmlFor="name">Nome Completo</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </span>
                <input id="name" name="name" type="text" placeholder="Seu nome completo" required />
              </div>
            </div>
          ) : null}

          <div className={styles.group}>
            <label htmlFor="email">E-mail</label>
            <div className={`${styles.field} corner-box`}>
              <span className={styles.fieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input id="email" name="email" type="email" placeholder="seu@email.com" required />
            </div>
          </div>

          {tab === 'register' ? (
            <div className={styles.group}>
              <label htmlFor="cpf">CPF</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M7 9h10M7 13h6" />
                  </svg>
                </span>
                <input id="cpf" name="cpf" type="text" placeholder="000.000.000-00" maxLength={14} required />
              </div>
            </div>
          ) : null}

          <div className={styles.group}>
            <label htmlFor="senha">Senha</label>
            <div className={`${styles.field} corner-box`}>
              <span className={styles.fieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input id="senha" name="senha" type={showPass ? 'text' : 'password'} placeholder="********" required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((value) => !value)}>
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

          {tab === 'register' ? (
            <div className={styles.group}>
              <label htmlFor="confirmSenha">Confirmar Senha</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input id="confirmSenha" name="confirmSenha" type={showConfirm ? 'text' : 'password'} placeholder="********" required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((value) => !value)}>
                  {showConfirm ? (
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
          ) : null}

          {!hasFirebaseConfig ? (
            <p className={styles.termsText}>
              Firebase nao configurado. A autenticacao e o Firestore entram em modo demonstracao ate preencher as variaveis VITE_FIREBASE_*.
            </p>
          ) : null}

          {errorMessage ? (
            <p className={styles.termsText} style={{ color: '#ff9db3' }}>
              {errorMessage}
            </p>
          ) : null}

          <button className={`${styles.btn} corner-box`} type="submit" disabled={pending}>
            {pending ? 'PROCESSANDO...' : tab === 'login' ? 'ACESSAR MINHA CONTA' : 'CRIAR MINHA CONTA'}
          </button>

          {tab === 'register' ? (
            <p className={styles.termsText}>
              Ao criar uma conta, voce concorda com nossos <a href="#" className={styles.link}>Termos de Uso</a> e <a href="#" className={styles.link}>Politica de Privacidade</a>.
            </p>
          ) : null}
        </form>

        <div className={styles.footerCard}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Protegido por criptografia de ponta a ponta
        </div>
      </main>
    </div>
  )
}
