import { asaasRequest, ensureCustomer, ensurePost, getRemoteIp, jsonError, jsonOk, readJsonBody } from './_asaas.mjs'

function sanitizeDigits(value, maxLength = 32) {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength)
}

export async function handler(event) {
  const methodError = ensurePost(event)
  if (methodError) return methodError

  try {
    const body = readJsonBody(event)
    const holder = body?.holderInfo || {}
    const card = body?.creditCard || {}

    if (!holder.name || !holder.email || !holder.cpfCnpj || !holder.postalCode || !holder.addressNumber || !holder.mobilePhone) {
      return jsonError(400, 'Preencha os dados do titular para tokenizar o cartao.')
    }

    if (!card.holderName || !card.number || !card.expiryMonth || !card.expiryYear || !card.ccv) {
      return jsonError(400, 'Dados do cartao incompletos para tokenizacao.')
    }

    const customer = await ensureCustomer({
      name: holder.name,
      cpfCnpj: sanitizeDigits(holder.cpfCnpj, 14),
      email: holder.email,
      mobilePhone: sanitizeDigits(holder.mobilePhone, 11),
      postalCode: sanitizeDigits(holder.postalCode, 8),
      addressNumber: String(holder.addressNumber || '').trim(),
      externalReference: body.userUid || holder.email,
    })

    const data = await asaasRequest('/creditCard/tokenizeCreditCard', {
      method: 'POST',
      body: {
        customer: customer.id,
        creditCard: {
          holderName: card.holderName,
          number: sanitizeDigits(card.number, 16),
          expiryMonth: sanitizeDigits(card.expiryMonth, 2),
          expiryYear: sanitizeDigits(card.expiryYear, 4),
          ccv: sanitizeDigits(card.ccv, 4),
        },
        creditCardHolderInfo: {
          name: holder.name,
          email: holder.email,
          cpfCnpj: sanitizeDigits(holder.cpfCnpj, 14),
          postalCode: sanitizeDigits(holder.postalCode, 8),
          addressNumber: String(holder.addressNumber || '').trim(),
          phone: sanitizeDigits(holder.phone || holder.mobilePhone, 11),
          mobilePhone: sanitizeDigits(holder.mobilePhone, 11),
        },
        remoteIp: getRemoteIp(event),
      },
    })

    return jsonOk({
      provider: 'asaas',
      customerId: customer.id,
      creditCardToken: data.creditCardToken || data.token || null,
      last4: sanitizeDigits(card.number, 16).slice(-4),
      brand: body.brand || null,
    })
  } catch (error) {
    return jsonError(500, error.message || 'Nao foi possivel tokenizar o cartao.')
  }
}
