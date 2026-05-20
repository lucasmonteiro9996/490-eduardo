import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase.js'
import { getAppUrl } from './appUrl.js'
import { mapFirebaseAuthError } from './authErrors.js'

const FUNCTIONS_BASE_URL = String(import.meta.env.VITE_FUNCTIONS_BASE_URL || '').trim().replace(/\/$/, '')
const USE_SERVER_RESET = String(import.meta.env.VITE_PASSWORD_RESET_SERVER || '').toLowerCase() === 'true'

function resolveFunctionUrl(path) {
  if (!FUNCTIONS_BASE_URL) {
    return `/.netlify/functions/${path}`
  }

  if (/\/api$/i.test(FUNCTIONS_BASE_URL)) {
    return `${FUNCTIONS_BASE_URL}/${path}`
  }

  return `${FUNCTIONS_BASE_URL}/${path}`
}

function shouldTryServerReset() {
  if (USE_SERVER_RESET) return true
  if (FUNCTIONS_BASE_URL) return true
  return import.meta.env.DEV
}

async function tryServerPasswordReset(email) {
  if (!shouldTryServerReset()) {
    return false
  }

  try {
    const response = await fetch(resolveFunctionUrl('password-reset-request'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const contentType = String(response.headers.get('content-type') || '').toLowerCase()
    if (!contentType.includes('application/json')) {
      return false
    }

    const data = await response.json().catch(() => null)
    if (!response.ok || !data?.ok) {
      return false
    }

    return data.provider === 'emailjs' || data.provider === 'noop'
  } catch {
    return false
  }
}

async function requestPasswordResetViaFirebase(email) {
  if (!auth) {
    throw new Error('Firebase não configurado. Preencha as variáveis VITE_FIREBASE_*.')
  }

  auth.languageCode = 'pt-BR'

  const continueUrl = getAppUrl()
  const actionCodeSettings = continueUrl
    ? { url: continueUrl, handleCodeInApp: false }
    : undefined

  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings)
  } catch (error) {
    const code = String(error?.code || '')
    const canRetryWithoutContinueUrl = actionCodeSettings
      && (code === 'auth/invalid-continue-uri' || code === 'auth/unauthorized-continue-uri')

    if (canRetryWithoutContinueUrl) {
      try {
        await sendPasswordResetEmail(auth, email)
        return
      } catch (retryError) {
        throw new Error(mapFirebaseAuthError(retryError))
      }
    }

    throw new Error(mapFirebaseAuthError(error))
  }
}

export async function requestPasswordReset(email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) {
    throw new Error('Informe seu e-mail.')
  }

  const handledByServer = await tryServerPasswordReset(normalized)
  if (handledByServer) {
    return
  }

  await requestPasswordResetViaFirebase(normalized)
}
