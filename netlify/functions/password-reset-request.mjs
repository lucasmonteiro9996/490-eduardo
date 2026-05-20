import { getFirebaseAuth } from './_auth.mjs'
import { ensurePost, jsonError, jsonOk, readJsonBody } from './_asaas.mjs'
import { getEmailJsConfig, sendEmailJs } from './_emailjs.mjs'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getContinueUrl() {
  return String(
    process.env.VITE_APP_URL
    || process.env.URL
    || process.env.DEPLOY_PRIME_URL
    || 'https://ocn.capital',
  ).trim().replace(/\/$/, '')
}

export async function handler(event) {
  const methodError = ensurePost(event)
  if (methodError) return methodError

  let body
  try {
    body = readJsonBody(event)
  } catch {
    return jsonError(400, 'Corpo da requisicao invalido.')
  }

  const email = String(body?.email || '').trim().toLowerCase()
  if (!email || !EMAIL_PATTERN.test(email)) {
    return jsonError(400, 'Informe um e-mail valido.')
  }

  const continueUrl = getContinueUrl()
  let resetLink = null
  let auth

  try {
    auth = getFirebaseAuth()
  } catch {
    return jsonOk({ ok: true, provider: 'client-fallback' })
  }

  try {
    try {
      await auth.getUserByEmail(email)
    } catch {
      return jsonOk({ ok: true, provider: 'client-fallback', reason: 'user-not-found' })
    }

    resetLink = await auth.generatePasswordResetLink(email, {
      url: continueUrl,
      handleCodeInApp: false,
    })
  } catch {
    return jsonOk({ ok: true, provider: 'client-fallback' })
  }

  const emailJsConfig = getEmailJsConfig()
  if (emailJsConfig && resetLink) {
    try {
      await sendEmailJs({
        serviceId: emailJsConfig.serviceId,
        templateId: emailJsConfig.templateId,
        publicKey: emailJsConfig.publicKey,
        templateParams: {
          to_email: email,
          user_email: email,
          reset_link: resetLink,
          app_url: continueUrl,
          message: 'Clique no link abaixo para redefinir sua senha na Ocean Capital.',
        },
      })

      return jsonOk({ ok: true, provider: 'emailjs' })
    } catch {
      return jsonOk({ ok: true, provider: 'client-fallback' })
    }
  }

  return jsonOk({ ok: true, provider: 'client-fallback' })
}
