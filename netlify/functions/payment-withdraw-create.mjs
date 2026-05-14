import { asaasRequest, ensurePost, jsonError, jsonOk, readJsonBody } from './_asaas.mjs'
import { requireFirebaseAuth } from './_auth.mjs'

function sanitizeDigits(value, maxLength = 32) {
  return String(value || '').replace(/\D/g, '').slice(0, maxLength)
}

function mapAccountType(value) {
  const raw = String(value || '').toUpperCase()
  if (raw === 'SAVINGS_ACCOUNT' || raw === 'POUPANCA') return 'SAVINGS_ACCOUNT'
  return 'CHECKING_ACCOUNT'
}

export async function handler(event) {
  const methodError = ensurePost(event)
  if (methodError) return methodError

  try {
    const authResult = await requireFirebaseAuth(event, { requireAdmin: true })
    if (authResult.error) return authResult.error

    const body = readJsonBody(event)
    const amount = Number(body.amount) || 0
    const bankAccount = body?.payoutDetails?.bankAccount

    if (body.symbol !== 'BRL') {
      return jsonError(400, 'O saque real automatizado esta disponivel apenas para BRL via TED nesta etapa.')
    }

    if (amount <= 0) {
      return jsonError(400, 'Valor de saque invalido.')
    }

    if (!bankAccount) {
      return jsonError(400, 'Dados bancarios obrigatorios para TED.')
    }

    const payload = {
      value: amount,
      operationType: 'TED',
      externalReference: body.requestId || undefined,
      bankAccount: {
        bank: {
          code: sanitizeDigits(bankAccount.bankCode, 8),
        },
        ownerName: String(bankAccount.ownerName || '').trim(),
        cpfCnpj: sanitizeDigits(bankAccount.cpfCnpj, 14),
        agency: sanitizeDigits(bankAccount.agency, 10),
        account: sanitizeDigits(bankAccount.account, 16),
        accountDigit: sanitizeDigits(bankAccount.accountDigit, 4),
        bankAccountType: mapAccountType(bankAccount.bankAccountType),
      },
    }

    if (
      !payload.bankAccount.bank.code
      || !payload.bankAccount.ownerName
      || !payload.bankAccount.cpfCnpj
      || !payload.bankAccount.agency
      || !payload.bankAccount.account
    ) {
      return jsonError(400, 'Preencha todos os dados bancarios obrigatorios para a TED.')
    }

    const data = await asaasRequest('/transfers', {
      method: 'POST',
      body: payload,
    })

    return jsonOk({
      provider: 'asaas',
      flow: 'ted_transfer',
      status: data.status || 'PENDING',
      transferId: data.id || null,
      effectiveDate: data.effectiveDate || null,
      requestedAt: data.dateCreated || null,
    })
  } catch (error) {
    return jsonError(500, error.message || 'Nao foi possivel criar a transferencia real.')
  }
}
