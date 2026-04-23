import { useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { ADMIN_NOTIFICATION_EMAIL } from '../lib/emailService.js'
import { useToast } from '../components/Toast.jsx'
import styles from './AdminPage.module.css'

// ── Email card com ações Aprovar / Recusar ─────────────────────────────────

function EmailCard({ email, onApprove, onReject }) {
  const [rejectMode, setRejectMode] = useState(false)
  const [reason, setReason] = useState('')

  const isDeposit = email.type === 'deposit'
  const isPending = email.status === 'pending'
  const typeLabel = isDeposit ? 'Depósito' : 'Saque'

  function handleConfirmReject() {
    onReject(email.requestId, reason.trim() || null)
    setRejectMode(false)
    setReason('')
  }

  return (
    <div className={`${styles.emailCard} ${isPending ? '' : styles.resolved}`}>

      {/* Cabeçalho */}
      <div className={styles.emailHeader}>
        <div className={styles.emailMeta}>
          <span className={styles.emailSubject}>{email.subject}</span>
          <span className={styles.emailFrom}>
            De: <strong>{email.from}</strong> → Para: {email.to}
          </span>
          {email.emailStatus ? (
            <span className={styles.emailFrom}>
              Email do admin: <strong>{email.emailStatus === 'sent' ? 'enviado' : email.emailStatus === 'skipped' ? 'configuração pendente' : 'falhou'}</strong>
            </span>
          ) : null}
        </div>
        <span className={styles.emailTime}>{email.sentAt}</span>
      </div>

      {/* Corpo */}
      <div
        className={styles.emailBody}
        dangerouslySetInnerHTML={{ __html: email.body }}
      />

      {/* Destaque de valores */}
      <div className={styles.emailAmount}>
        <span className={`${styles.typeBadge} ${styles[email.type]}`}>
          {isDeposit ? '↓ ' : '↑ '}{typeLabel}
        </span>
        <div className={styles.amountItem}>
          <span className={styles.amountLabel}>Valor solicitado</span>
          <span className={`${styles.amountValue} ${styles[email.type]}`}>
            {email.formattedAmount}
          </span>
        </div>
        <div className={styles.amountItem}>
          <span className={styles.amountLabel}>Moeda</span>
          <span className={styles.amountValue}>{email.symbol}</span>
        </div>
        <div className={styles.amountItem}>
          <span className={styles.amountLabel}>{isDeposit ? 'Origem' : 'Destino'}</span>
          <span className={styles.amountValue}>
            {isDeposit ? (email.source || '—') : (email.destination || '—')}
          </span>
        </div>
      </div>

      {/* Ações */}
      <div className={styles.emailActions}>
        {!isPending ? (
          <span className={`${styles.statusResolved} ${styles[email.status]}`}>
            {email.status === 'approved' ? '✅ Aprovada' : '❌ Recusada'}
          </span>
        ) : rejectMode ? (
          <div className={styles.rejectForm}>
            <input
              type="text"
              className={styles.rejectInput}
              placeholder="Motivo da recusa (opcional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmReject()}
              autoFocus
            />
            <div className={styles.btnActions}>
              <button
                type="button"
                className={styles.btnCancelReject}
                onClick={() => { setRejectMode(false); setReason('') }}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.btnConfirmReject}
                onClick={handleConfirmReject}
              >
                Confirmar recusa
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.btnActions}>
            <button
              type="button"
              className={styles.btnApprove}
              onClick={() => onApprove(email.requestId)}
            >
              ✓ Aprovar
            </button>
            <button
              type="button"
              className={styles.btnReject}
              onClick={() => setRejectMode(true)}
            >
              ✕ Recusar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

export default function AdminPage() {
  const { pendingRequests, resolvedRequests, approveRequest, rejectRequest } = useWorkspace()
  const toast = useToast()

  // Converte pendingRequests em "emails" para exibição (mesma estrutura do service)
  const pendingEmails = pendingRequests.map((req) => ({
    id: `display-${req.requestId}`,
    requestId: req.requestId,
    from: req.userEmail,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: req.type === 'deposit'
      ? `Solicitação de depósito — ${req.formattedAmount}`
      : `Solicitação de saque — ${req.formattedAmount}`,
    body: req.type === 'deposit'
      ? `O cliente <strong>${req.userEmail}</strong> solicita um depósito de <strong>${req.formattedAmount}</strong> via <em>${req.source || 'TED'}</em>.<br/><br/>Avalie e aprove ou recuse a operação.`
      : `O cliente <strong>${req.userEmail}</strong> solicita um saque de <strong>${req.formattedAmount}</strong> via <em>${req.destination || 'TED'}</em>.<br/><br/>Avalie e aprove ou recuse a operação.`,
    type: req.type,
    symbol: req.symbol,
    formattedAmount: req.formattedAmount,
    source: req.source,
    destination: req.destination,
    sentAt: req.createdAtLabel || req.createdAt,
    status: 'pending',
    emailStatus: req.emailStatus,
  }))

  const historyEmails = resolvedRequests.map((req) => ({
    id: `resolved-${req.requestId}`,
    requestId: req.requestId,
    from: req.userEmail,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: req.type === 'deposit'
      ? `Solicitação de depósito — ${req.formattedAmount}`
      : `Solicitação de saque — ${req.formattedAmount}`,
    body: req.type === 'deposit'
      ? `O cliente <strong>${req.userEmail}</strong> solicitou um depósito de <strong>${req.formattedAmount}</strong> via <em>${req.source || 'TED'}</em>.`
      : `O cliente <strong>${req.userEmail}</strong> solicitou um saque de <strong>${req.formattedAmount}</strong> via <em>${req.destination || 'TED'}</em>.`,
    type: req.type,
    symbol: req.symbol,
    formattedAmount: req.formattedAmount,
    source: req.source,
    destination: req.destination,
    sentAt: req.resolvedAtLabel || req.createdAtLabel || req.createdAt,
    status: req.status,
    emailStatus: req.emailStatus,
  }))

  const totalPending = pendingEmails.length
  const totalApproved = historyEmails.filter((e) => e.status === 'approved').length
  const totalRejected = historyEmails.filter((e) => e.status === 'rejected').length

  async function handleApprove(requestId) {
    const email = pendingEmails.find((e) => e.requestId === requestId)
    await approveRequest(requestId)
    toast.push({
      type: 'success',
      title: 'Solicitação aprovada',
      message: email?.emailStatus === 'sent'
        ? 'O pedido foi aprovado, o saldo foi atualizado e o email já tinha sido enviado ao admin.'
        : 'O pedido foi aprovado e o saldo do cliente foi atualizado.',
    })
  }

  async function handleReject(requestId, reason) {
    await rejectRequest(requestId, reason)
    toast.push({
      type: 'error',
      title: 'Solicitação recusada',
      message: reason
        ? `Motivo enviado ao cliente: "${reason}"`
        : 'O cliente foi notificado sobre a recusa.',
    })
  }

  return (
    <div className={styles.main}>

      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>Painel do Administrador</h2>
          <span className={styles.pageSubtitle}>Inbox de solicitações pendentes</span>
        </div>
        <span className={styles.adminBadge}>⚙ Admin</span>
      </header>

      <div className={styles.content}>

        {/* Header card com estatísticas */}
        <div className={`${styles.headerCard} corner-box`}>
          <div className={styles.headerLeft}>
            <span className={styles.headerKicker}>Inbox do administrador</span>
            <h3 className={styles.headerTitle}>{ADMIN_NOTIFICATION_EMAIL}</h3>
            <p className={styles.headerDescription}>
              Cada solicitação de depósito ou saque feita pelos clientes chega aqui na inbox de aprovações.
              Além disso, o aviso também é enviado para o email do administrador.
            </p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statPill}>
              <span className={`${styles.statPillValue} ${styles.pending}`}>{totalPending}</span>
              <span className={styles.statPillLabel}>Pendentes</span>
            </div>
            <div className={styles.statPill}>
              <span className={`${styles.statPillValue} ${styles.approved}`}>{totalApproved}</span>
              <span className={styles.statPillLabel}>Aprovadas</span>
            </div>
            <div className={styles.statPill}>
              <span className={`${styles.statPillValue} ${styles.rejected}`}>{totalRejected}</span>
              <span className={styles.statPillLabel}>Recusadas</span>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              Aguardando avaliação
              {totalPending > 0 && ` (${totalPending})`}
            </span>
          </div>

          {pendingEmails.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <span className={styles.emptyTitle}>Inbox vazio</span>
              <p className={styles.emptyDesc}>
                Nenhuma solicitação pendente no momento. Quando um cliente solicitar
                depósito ou saque, o pedido aparecerá aqui.
              </p>
            </div>
          ) : (
            pendingEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>

        {/* Histórico de resolvidas */}
        {historyEmails.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Histórico de aprovações</span>
            </div>
            {historyEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onApprove={() => {}}
                onReject={() => {}}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
