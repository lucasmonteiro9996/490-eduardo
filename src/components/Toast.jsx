import { createContext, useCallback, useContext, useRef, useState } from 'react'
import styles from './Toast.module.css'

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext(null)

const ICONS = {
  info: '📧',
  success: '✅',
  error: '❌',
  warning: '⚠️',
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 240)
  }, [])

  const push = useCallback(
    ({ title, message, type = 'info', duration = 4500 }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => [...prev, { id, title, message, type, leaving: false }])

      if (duration > 0) {
        timers.current[id] = setTimeout(() => dismiss(id), duration)
      }

      return id
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type]} ${toast.leaving ? styles.leaving : ''}`}
          >
            <span className={styles.icon}>{ICONS[toast.type] ?? ICONS.info}</span>
            <div className={styles.body}>
              {toast.title && <span className={styles.title}>{toast.title}</span>}
              {toast.message && <span className={styles.message}>{toast.message}</span>}
            </div>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => dismiss(toast.id)}
              aria-label="Fechar"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider.')
  return ctx
}
