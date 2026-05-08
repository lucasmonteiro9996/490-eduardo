const REAL_PAYMENTS_FLAG = String(import.meta.env.VITE_REAL_PAYMENTS_ENABLED || '').toLowerCase() === 'true'

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
  return postJson('/.netlify/functions/payment-deposit-create', payload)
}

export async function createRealWithdrawalTransfer(payload) {
  return postJson('/.netlify/functions/payment-withdraw-create', payload)
}

export async function tokenizeRealCard(payload) {
  return postJson('/.netlify/functions/card-tokenize', payload)
}
