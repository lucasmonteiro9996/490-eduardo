import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './AuthPage.module.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className={styles.bg}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />

      <main className={`${styles.card} corner-box`}>
        {/* Logo */}
        <div className={styles.header}>
          <div className={styles.logoWrap}>
            <span className={styles.logoIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="none" stroke="#4a7fdb" strokeWidth="2" />
                <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" fill="rgba(74,127,219,0.15)" stroke="#4a7fdb" strokeWidth="1.2" />
                <circle cx="14" cy="14" r="3" fill="#4a7fdb" />
              </svg>
            </span>
            <span className={styles.logoText}>CryptBank</span>
          </div>
          <p className={styles.subtitle}>Seu banco digital em stablecoins</p>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
            type="button"
          >
            <span className={styles.tabIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </span>
            Criar Conta
          </button>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className={styles.group}>
              <label htmlFor="name">Nome Completo</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input id="name" type="text" placeholder="Seu nome completo" required />
              </div>
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="email">E-mail</label>
            <div className={`${styles.field} corner-box`}>
              <span className={styles.fieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </span>
              <input id="email" type="email" placeholder="seu@email.com" required />
            </div>
          </div>

          {tab === 'register' && (
            <div className={styles.group}>
              <label htmlFor="cpf">CPF</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="16" rx="2"/>
                    <path d="M7 9h10M7 13h6"/>
                  </svg>
                </span>
                <input id="cpf" type="text" placeholder="000.000.000-00" maxLength={14} required />
              </div>
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="senha">Senha</label>
            <div className={`${styles.field} corner-box`}>
              <span className={styles.fieldIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input id="senha" type={showPass ? 'text' : 'password'} placeholder="••••••••" required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(v => !v)}>
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {tab === 'register' && (
            <div className={styles.group}>
              <label htmlFor="confirmSenha">Confirmar Senha</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input id="confirmSenha" type={showConfirm ? 'text' : 'password'} placeholder="••••••••" required />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
                  {showConfirm ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {tab === 'login' && (
            <div className={styles.group}>
              <label htmlFor="codigo">Código 2FA</label>
              <div className={`${styles.field} corner-box`}>
                <span className={styles.fieldIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </span>
                <input id="codigo" type="text" placeholder="000 000" maxLength={7} />
              </div>
            </div>
          )}

          {tab === 'login' && (
            <div className={styles.forgotRow}>
              <a href="#" className={styles.forgotLink}>Esqueci minha senha</a>
            </div>
          )}

          <button className={`${styles.btn} corner-box`} type="submit">
            {tab === 'login' ? 'ACESSAR MINHA CONTA' : 'CRIAR MINHA CONTA'}
          </button>

          {tab === 'register' && (
            <p className={styles.termsText}>
              Ao criar uma conta, você concorda com nossos{' '}
              <a href="#" className={styles.link}>Termos de Uso</a> e{' '}
              <a href="#" className={styles.link}>Política de Privacidade</a>.
            </p>
          )}
        </form>

        <div className={styles.footerCard}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Protegido por criptografia de ponta a ponta
        </div>
      </main>
    </div>
  )
}
