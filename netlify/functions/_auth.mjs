import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { jsonError } from './_asaas.mjs'

const ADMIN_EMAIL = 'siteocn@gmail.com'

function getFirebaseAuth() {
  if (getApps().length === 0) {
    const raw = String(process.env.FIREBASE_SERVICE_ACCOUNT_JSON || '').trim()
    if (!raw) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON nao configurada no ambiente.')
    }

    const serviceAccount = JSON.parse(raw)
    initializeApp({
      credential: cert(serviceAccount),
    })
  }

  return getAuth()
}

function readBearerToken(event) {
  const headers = event?.headers || {}
  const authHeader = headers.authorization || headers.Authorization || ''
  if (!authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.slice(7).trim()
}

export async function requireFirebaseAuth(event, options = {}) {
  const token = readBearerToken(event)
  if (!token) {
    return { error: jsonError(401, 'Autenticacao obrigatoria.') }
  }

  let decoded
  try {
    decoded = await getFirebaseAuth().verifyIdToken(token)
  } catch {
    return { error: jsonError(401, 'Token de autenticacao invalido ou expirado.') }
  }

  const email = String(decoded.email || '').trim().toLowerCase()
  const uid = decoded.uid

  if (options.requireAdmin && email !== ADMIN_EMAIL) {
    return { error: jsonError(403, 'Acesso restrito ao administrador.') }
  }

  if (options.requireUid && uid !== options.requireUid) {
    return { error: jsonError(403, 'Operacao nao autorizada para este usuario.') }
  }

  return { decoded, uid, email, isAdmin: email === ADMIN_EMAIL }
}
