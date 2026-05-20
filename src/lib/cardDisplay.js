/** Valores exibidos no cartão visual da área do cliente (sem dados sensíveis). */
export const CLIENT_CARD_MASK = {
  number: '•••• •••• •••• ••••',
  valid: '•• / ••',
  cvv: '•••',
  holder: 'TITULAR DO CARTÃO',
}

export function maskCardForClient(card = {}) {
  return {
    ...card,
    number: CLIENT_CARD_MASK.number,
    valid: CLIENT_CARD_MASK.valid,
    cvv: CLIENT_CARD_MASK.cvv,
    holder: CLIENT_CARD_MASK.holder,
  }
}

export function formatCardLast4(number = '') {
  const digits = String(number || '').replace(/\D/g, '')
  if (digits.length >= 4) return digits.slice(-4)
  const fromMask = String(number || '').match(/(\d{4})\s*$/)
  return fromMask?.[1] || '0000'
}
