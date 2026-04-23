// ─────────────────────────────────────────────────────────────────────────────
// Serviço de e-mail mockado — simula envio/recebimento sem backend real.
// Os dados ficam em memória (se-recarregar a página, limpa tudo — propositalmente).
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_EMAIL = 'siteocn@gmail.com'

/** @type {Array<import('../types').MockEmail>} */
let adminInbox = []

/** @type {Record<string, Array<import('../types').MockEmail>>} */
let userInboxes = {}

// ── helpers ────────────────────────────────────────────────────────────────

function nowLabel() {
  return new Date().toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Admin inbox ─────────────────────────────────────────────────────────────

/**
 * Simula envio de email ao admin solicitando depósito.
 */
export function sendDepositRequestToAdmin({ requestId, userEmail, symbol, amount, source, formattedAmount }) {
  const email = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    requestId,
    to: ADMIN_EMAIL,
    from: userEmail || 'cliente@oceancapital.com',
    subject: `Solicitação de depósito — ${formattedAmount}`,
    body: `O cliente <strong>${userEmail}</strong> solicita um depósito de <strong>${formattedAmount}</strong> via <em>${source}</em>.<br/><br/>Por favor, avalie e aprove ou recuse a operação.`,
    type: 'deposit',
    symbol,
    amount,
    source,
    userEmail: userEmail || 'cliente@oceancapital.com',
    formattedAmount,
    sentAt: nowLabel(),
    status: 'pending',
  }
  adminInbox = [email, ...adminInbox]
  return email
}

/**
 * Simula envio de email ao admin solicitando saque.
 */
export function sendWithdrawRequestToAdmin({ requestId, userEmail, symbol, amount, destination, formattedAmount }) {
  const email = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    requestId,
    to: ADMIN_EMAIL,
    from: userEmail || 'cliente@oceancapital.com',
    subject: `Solicitação de saque — ${formattedAmount}`,
    body: `O cliente <strong>${userEmail}</strong> solicita um saque de <strong>${formattedAmount}</strong> via <em>${destination}</em>.<br/><br/>Por favor, avalie e aprove ou recuse a operação.`,
    type: 'withdraw',
    symbol,
    amount,
    destination,
    userEmail: userEmail || 'cliente@oceancapital.com',
    formattedAmount,
    sentAt: nowLabel(),
    status: 'pending',
  }
  adminInbox = [email, ...adminInbox]
  return email
}

/**
 * Retorna uma cópia do inbox do admin.
 */
export function getAdminInbox() {
  return [...adminInbox]
}

/**
 * Marca um email do admin como resolvido (aprovado ou recusado).
 */
export function resolveAdminEmail(emailId, resolution) {
  adminInbox = adminInbox.map((e) =>
    e.id === emailId ? { ...e, status: resolution } : e,
  )
}

// ── User inbox ───────────────────────────────────────────────────────────────

/**
 * Simula envio de email ao usuário informando aprovação.
 */
export function sendApprovalToUser({ userEmail, type, formattedAmount }) {
  const label = type === 'deposit' ? 'depósito' : 'saque'
  const msg = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    to: userEmail,
    from: ADMIN_EMAIL,
    subject: `✅ Sua solicitação de ${label} foi aprovada`,
    body: `Sua solicitação de ${label} de <strong>${formattedAmount}</strong> foi <strong>aprovada</strong> pelo administrador. O saldo da sua conta já foi atualizado.`,
    type: 'approval',
    sentAt: nowLabel(),
    read: false,
  }
  userInboxes[userEmail] = [msg, ...(userInboxes[userEmail] || [])]
  return msg
}

/**
 * Simula envio de email ao usuário informando recusa.
 */
export function sendRejectionToUser({ userEmail, type, formattedAmount, reason }) {
  const label = type === 'deposit' ? 'depósito' : 'saque'
  const msg = {
    id: `email-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    to: userEmail,
    from: ADMIN_EMAIL,
    subject: `❌ Sua solicitação de ${label} foi recusada`,
    body: `Sua solicitação de ${label} de <strong>${formattedAmount}</strong> foi <strong>recusada</strong> pelo administrador.${reason ? `<br/><br/>Motivo: ${reason}` : ''}`,
    type: 'rejection',
    sentAt: nowLabel(),
    read: false,
  }
  userInboxes[userEmail] = [msg, ...(userInboxes[userEmail] || [])]
  return msg
}

/**
 * Retorna uma cópia do inbox do usuário.
 */
export function getUserInbox(userEmail) {
  return [...(userInboxes[userEmail] || [])]
}

/**
 * Marca uma notificação do usuário como lida.
 */
export function markUserNotificationRead(userEmail, msgId) {
  if (!userInboxes[userEmail]) return
  userInboxes[userEmail] = userInboxes[userEmail].map((m) =>
    m.id === msgId ? { ...m, read: true } : m,
  )
}
