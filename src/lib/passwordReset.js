import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase.js'
import { getAppUrl } from './appUrl.js'
import { mapFirebaseAuthError } from './authErrors.js'

const FUNCTIONS_BASE_URL = String(import.meta.env.VITE_FUNCTIONS_BASE_URL || '').trim().replace(/\/$/, '')

function resolveFunctionUrl(path) {
  if (!FUNCTIONS_BASE_URL) {
    return `/.netlify/functions/${path}`
  }

  if (/\/api$/i.test(FUNCTIONS_BASE_URL)) {
    return `${FUNCTIONS_BASE_URL}/${path}`
  }

  return `${FUNCTIONS_BASE_URL}/${path}`
}

/** Netlify: tenta enviar link via EmailJS no servidor (precisa FIREBASE_SERVICE_ACCOUNT_JSON + template). */
async function tryServerPasswordReset(email) {
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

    return data.provider === 'emailjs'
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

  // Primeiro sem URL customizada — evita auth/invalid-continue-uri e o e-mail costuma sair.
  try {
    await sendPasswordResetEmail(auth, email)
    return
  } catch (plainError) {
    const plainCode = String(plainError?.code || '')
    if (plainCode === 'auth/user-not-found' || plainCode === 'auth/invalid-email') {
      throw new Error(mapFirebaseAuthError(plainError))
    }
  }

  if (!continueUrl) {
    throw new Error('Não foi possível enviar o e-mail de redefinição. Tente novamente em instantes.')
  }

  try {
    await sendPasswordResetEmail(auth, email, {
      url: continueUrl,
      handleCodeInApp: false,
    })
  } catch (error) {
    const code = String(error?.code || '')
    if (code === 'auth/invalid-continue-uri' || code === 'auth/unauthorized-continue-uri') {
      throw new Error(mapFirebaseAuthError(error))
    }
    throw new Error(mapFirebaseAuthError(error))
  }
}

export async function requestPasswordReset(email) {
  const normalized = String(email || '').trim().toLowerCase()
  if (!normalized) {
    throw new Error('Informe seu e-mail.')
  }

  try {
    await requestPasswordResetViaFirebase(normalized)
    return
  } catch (firebaseError) {
    const sentByServer = await tryServerPasswordReset(normalized)
    if (sentByServer) {
      return
    }
    throw firebaseError
  }
}
