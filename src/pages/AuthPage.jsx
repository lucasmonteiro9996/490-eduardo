import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './AuthPage.module.css'

function formatCpf(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, register, resetPassword, hasFirebaseConfig, demoMode } = useAuth()

  function switchTab(next) {
    setTab(next)
    setForgotMode(false)
    setForgotSent(false)
    setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('login_email') || '').trim()
    const password = String(formData.get('access_key') || '')
    const name = String(formData.get('name') || '').trim()
    const cpf = String(formData.get('cpf') || '').trim()
    const confirmPassword = String(formData.get('confirm_access_key') || '')

    setErrorMessage('')

    if (forgotMode) {
      if (!email) {
        setErrorMessage('Informe seu e-mail para receber o link de redefinição.')
        return
      }
      setPending(true)
      try {
        await resetPassword(email)
        setForgotSent(true)
      } catch (error) {
        setErrorMessage(error?.message || 'Não foi possível enviar o link de redefinição.')
      } finally {
        setPending(false)
      }
      return
    }

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
      setErrorMessage(error?.message || 'Não foi possível autenticar agora.')
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
            <img
              src="/branding/logo-sem-fundo.png"
              alt="Ocean Capital Payment Manager"
              className={styles.logoMark}
            />
            <img
              src="/branding/logo-escritos-sem-fundo.png"
              alt="Ocean Capital Payment Manager"
              className={styles.logoImage}
            />
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchTab('login')}
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
            onClick={() => switchTab('register')}
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
            Criar conta
          </button>
        </div>

        <button
          type="button"
          className={styles.adminEntry}
          onClick={() => navigate('/admin')}
        >
          Entrar na área administrativa
        </button>

        <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">

          {/* ── Forgot mode: success state ─────────────────────────────── */}
          {forgotSent ? (
            <>
              <div className={styles.forgotSuccess}>
                <div className={styles.forgotSuccessIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className={styles.forgotSuccessTitle}>Link enviado!</span>
                <p className={styles.forgotSuccessDesc}>
                  Verifique sua caixa de entrada e a pasta de spam para redefinir sua senha.
                </p>
              </div>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => { setForgotMode(false); setForgotSent(false); setErrorMessage('') }}
              >
                ← Voltar ao login
              </button>
            </>
          ) : (
            <>
              {/* ── Forgot mode: form ──────────────────────────────────── */}
              {forgotMode && (
                <div className={styles.forgotHeader}>
                  <span className={styles.forgotKicker}>Redefinição de senha</span>
                  <p className={styles.forgotDesc}>
                    Informe seu e-mail e enviaremos um link para criar uma nova senha.
                  </p>
                </div>
              )}

              {/* ── Register-only: name ────────────────────────────────── */}
              {tab === 'register' && !forgotMode ? (
                <div className={styles.group}>
                  <label htmlFor="name">Nome completo</label>
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

              {/* ── Email (always visible) ─────────────────────────────── */}
              <div className={styles.group}>
                <label htmlFor="email">E-mail</label>
                <div className={`${styles.field} corner-box`}>
                  <span className={styles.fieldIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input id="email" name="login_email" type="email" placeholder="seu@email.com" autoComplete="off" required />
                </div>
              </div>

              {/* ── Register-only: CPF ─────────────────────────────────── */}
              {tab === 'register' && !forgotMode ? (
                <div className={styles.group}>
                  <label htmlFor="cpf">CPF</label>
                  <div className={`${styles.field} corner-box`}>
                    <span className={styles.fieldIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <path d="M7 9h10M7 13h6" />
                      </svg>
                    </span>
                    <input
                      id="cpf"
                      name="cpf"
                      type="text"
                      inputMode="numeric"
                      placeholder="000.000.000-00"
                      maxLength={14}
                      required
                      onChange={(event) => { event.target.value = formatCpf(event.target.value) }}
                    />
                  </div>
                </div>
              ) : null}

              {/* ── Password (hidden in forgot mode) ───────────────────── */}
              {!forgotMode && (
                <div className={styles.group}>
                  <label htmlFor="senha">Senha</label>
                  <div className={`${styles.field} corner-box`}>
                    <span className={styles.fieldIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="senha"
                      name="access_key"
                      type={showPass ? 'text' : 'password'}
                      placeholder="********"
                      autoComplete={tab === 'login' ? 'off' : 'new-password'}
                      required
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowPass((v) => !v)}>
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
              )}

              {/* ── Forgot link (login only) ───────────────────────────── */}
              {tab === 'login' && !forgotMode && (
                <div className={styles.forgotRow}>
                  <button
                    type="button"
                    className={styles.forgotLink}
                    onClick={() => { setForgotMode(true); setErrorMessage('') }}
                  >
                    Esqueci minha senha
                  </button>
                </div>
              )}

              {/* ── Register-only: confirm password ───────────────────── */}
              {tab === 'register' && !forgotMode ? (
                <div className={styles.group}>
                  <label htmlFor="confirmSenha">Confirmar Senha</label>
                  <div className={`${styles.field} corner-box`}>
                    <span className={styles.fieldIcon}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input
                      id="confirmSenha"
                      name="confirm_access_key"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="********"
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm((v) => !v)}>
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

              {/* ── Status messages ────────────────────────────────────── */}
              {!hasFirebaseConfig && !forgotMode ? (
                <p className={styles.termsText}>
                  Firebase não configurado. A autenticação entra em modo de demonstração até que as variáveis `VITE_FIREBASE_*` sejam preenchidas.
                </p>
              ) : null}

              {demoMode && !forgotMode ? (
                <p className={styles.termsText}>
                  Firebase indisponível no momento. Você entrou em modo de demonstração.
                </p>
              ) : null}

              {errorMessage ? (
                <p className={styles.termsText} style={{ color: '#ff9db3' }}>
                  {errorMessage}
                </p>
              ) : null}

              {/* ── Submit ─────────────────────────────────────────────── */}
              <button className={`${styles.btn} corner-box`} type="submit" disabled={pending}>
                {pending ? 'PROCESSANDO...' : forgotMode ? 'ENVIAR LINK DE REDEFINIÇÃO' : tab === 'login' ? 'ACESSAR MINHA CONTA' : 'CRIAR MINHA CONTA'}
              </button>

              {/* ── Back button (forgot mode only) ─────────────────────── */}
              {forgotMode && (
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => { setForgotMode(false); setErrorMessage('') }}
                >
                  ← Voltar ao login
                </button>
              )}

              {tab === 'register' && !forgotMode ? (
                <p className={styles.termsText}>
                  Ao criar uma conta, você concorda com nossos <a href="#" className={styles.link}>Termos de Uso</a> e com a <a href="#" className={styles.link}>Política de Privacidade</a>.
                </p>
              ) : null}
            </>
          )}
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
