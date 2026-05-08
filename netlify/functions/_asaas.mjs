const ASAAS_ENV = String(process.env.ASAAS_ENV || 'sandbox').toLowerCase()
const ASAAS_BASE_URL = ASAAS_ENV === 'production'
  ? 'https://api.asaas.com/v3'
  : 'https://api-sandbox.asaas.com/v3'

function buildJsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(payload),
  }
}

export function jsonOk(payload) {
  return buildJsonResponse(200, payload)
}

export function jsonError(statusCode, message, extra = {}) {
  return buildJsonResponse(statusCode, {
    error: message,
    ...extra,
  })
}

export function ensurePost(event) {
  if (event.httpMethod !== 'POST') {
    return jsonError(405, 'Metodo nao permitido.')
  }

  return null
}

export function readJsonBody(event) {
  try {
    return JSON.parse(event.body || '{}')
  } catch {
    throw new Error('Corpo da requisicao invalido.')
  }
}

export function getAsaasApiKey() {
  return String(process.env.ASAAS_API_KEY || '').trim()
}

export function getRemoteIp(event) {
  const headers = event?.headers || {}
  return (
    headers['x-nf-client-connection-ip']
    || headers['x-forwarded-for']?.split(',')?.[0]?.trim()
    || headers['client-ip']
    || '127.0.0.1'
  )
}

export async function ensureCustomer({
  name,
  cpfCnpj,
  email,
  mobilePhone,
  postalCode,
  addressNumber,
  externalReference,
}) {
  return asaasRequest('/customers', {
    method: 'POST',
    body: {
      name,
      cpfCnpj,
      email,
      mobilePhone,
      postalCode,
      addressNumber,
      externalReference,
      notificationDisabled: true,
    },
  })
}

export async function asaasRequest(path, { method = 'GET', body } = {}) {
  const apiKey = getAsaasApiKey()
  if (!apiKey) {
    throw new Error('ASAAS_API_KEY nao configurada no ambiente.')
  }

  const response = await fetch(`${ASAAS_BASE_URL}${path}`, {
    method,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      access_token: apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await response.text()
  let data = {}

  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }
  }

  if (!response.ok) {
    const apiMessage = Array.isArray(data?.errors) && data.errors[0]?.description
      ? data.errors[0].description
      : data?.message || data?.error || 'Falha ao comunicar com o provedor financeiro.'

    throw new Error(apiMessage)
  }

  return data
}
