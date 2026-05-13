const REAL_PAYMENTS_FLAG = String(import.meta.env.VITE_REAL_PAYMENTS_ENABLED || '').toLowerCase() === 'true'
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

async function postJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error || 'Não foi possível processar a operação financeira real agora.')
  }

  return data
}

export function isRealPaymentsEnabled() {
  return REAL_PAYMENTS_FLAG
}

export async function createRealDepositCharge(payload) {
  return postJson(resolveFunctionUrl('payment-deposit-create'), payload)
}

export async function createRealWithdrawalTransfer(payload) {
  return postJson(resolveFunctionUrl('payment-withdraw-create'), payload)
}

export async function tokenizeRealCard(payload) {
  return postJson(resolveFunctionUrl('card-tokenize'), payload)
}
