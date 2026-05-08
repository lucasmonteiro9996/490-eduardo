import { asaasRequest, ensureCustomer, ensurePost, jsonError, jsonOk, readJsonBody } from './_asaas.mjs'

function normalizeMethod(value) {
  return String(value || '').toLowerCase()
}

function mapBillingType(source) {
  const method = normalizeMethod(source)
  if (method.includes('cart')) return 'CREDIT_CARD'
  if (method.includes('boleto')) return 'BOLETO'
  return null
}

export async function handler(event) {
  const methodError = ensurePost(event)
  if (methodError) return methodError

  try {
    const body = readJsonBody(event)
    const amount = Number(body.amount) || 0
    const source = body.source || ''
    const billingType = mapBillingType(source)
    const cardToken = body?.card?.providerToken || null

    if (body.symbol !== 'BRL') {
      return jsonError(400, 'O deposito real via provedor esta disponivel apenas para BRL nesta etapa.')
    }

    if (!billingType) {
      return jsonError(400, 'Metodo de deposito real ainda nao suportado. Use Cartao ou Boleto bancario.')
    }

    if (amount <= 0) {
      return jsonError(400, 'Valor de deposito invalido.')
    }

    if (billingType === 'CREDIT_CARD' && cardToken) {
      const customer = await ensureCustomer({
        name: body.userName || 'Cliente Ocean Capital',
        cpfCnpj: body.card?.cpfCnpj || '00000000000',
        email: body.userEmail,
        mobilePhone: body.card?.mobilePhone || '11999999999',
        postalCode: body.card?.postalCode || '00000000',
        addressNumber: body.card?.addressNumber || '0',
        externalReference: body.userUid || body.userEmail || body.requestId,
      })

      const payment = await asaasRequest('/lean/payments', {
        method: 'POST',
        body: {
          customer: customer.id,
          billingType: 'CREDIT_CARD',
          value: amount,
          dueDate: new Date().toISOString().slice(0, 10),
          description: `Deposito Ocean Capital - ${body.requestId || 'sem-id'}`,
          externalReference: body.requestId || undefined,
        },
      })

      const paymentResult = await asaasRequest(`/payments/${payment.id}/payWithCreditCard`, {
        method: 'POST',
        body: {
          creditCardToken: cardToken,
        },
      })

      return jsonOk({
        provider: 'asaas',
        flow: 'tokenized_card_charge',
        status: paymentResult.status || payment.status || 'RECEIVED',
        paymentId: payment.id || null,
        invoiceUrl: payment.invoiceUrl || null,
      })
    }

    const payload = {
      name: `Deposito Ocean Capital - ${body.userName || 'Cliente'}`,
      description: `Solicitacao ${body.requestId || 'sem-id'} - ${body.userEmail || 'sem-email'}`,
      value: amount,
      billingType,
      chargeType: 'DETACHED',
      externalReference: body.requestId || undefined,
      notificationEnabled: false,
    }

    if (billingType === 'BOLETO') {
      payload.dueDateLimitDays = 3
    }

    const data = await asaasRequest('/paymentLinks', {
      method: 'POST',
      body: payload,
    })

    return jsonOk({
      provider: 'asaas',
      flow: 'hosted_checkout',
      status: 'created',
      billingType,
      paymentLinkId: data.id || data.paymentLink || null,
      checkoutUrl: data.url || data.invoiceUrl || data.shortUrl || null,
      rawStatus: data.status || null,
    })
  } catch (error) {
    return jsonError(500, error.message || 'Nao foi possivel criar a cobranca real.')
  }
}
