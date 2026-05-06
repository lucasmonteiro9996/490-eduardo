import { useEffect, useMemo, useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext.jsx'
import { ADMIN_NOTIFICATION_EMAIL } from '../lib/emailService.js'
import { useToast } from '../components/Toast.jsx'
import { loadAdminClients } from '../lib/adminFirestoreService.js'
import styles from './AdminPage.module.css'

function formatCompactUSD(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)
}

function formatCompactBRL(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(0)}%`
}

function normalizeDate(value, fallbackLabel) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000)

  if (typeof fallbackLabel === 'string' && /^\d{2}\/\d{2}\/\d{4}/.test(fallbackLabel)) {
    const [datePart, timePart] = fallbackLabel.split(', ')
    const [day, month, year] = datePart.split('/').map(Number)
    const [hour = 0, minute = 0] = String(timePart || '').split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute)
  }

  return new Date()
}

function buildBuckets(period) {
  const now = new Date()

  if (period === 'day') {
    const start = new Date(now.getTime() - (5 * 4 * 60 * 60 * 1000))
    return Array.from({ length: 6 }, (_, index) => {
      const bucketStart = new Date(start.getTime() + (index * 4 * 60 * 60 * 1000))
      const bucketEnd = new Date(bucketStart.getTime() + (4 * 60 * 60 * 1000))
      return {
        label: `${String(bucketStart.getHours()).padStart(2, '0')}h`,
        start: bucketStart,
        end: bucketEnd,
      }
    })
  }

  if (period === 'week') {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)

    return Array.from({ length: 7 }, (_, index) => {
      const bucketStart = new Date(start)
      bucketStart.setDate(start.getDate() + index)
      const bucketEnd = new Date(bucketStart)
      bucketEnd.setDate(bucketStart.getDate() + 1)
      return {
        label: bucketStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        start: bucketStart,
        end: bucketEnd,
      }
    })
  }

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - 29)

  return Array.from({ length: 6 }, (_, index) => {
    const bucketStart = new Date(start)
    bucketStart.setDate(start.getDate() + (index * 5))
    const bucketEnd = new Date(bucketStart)
    bucketEnd.setDate(bucketStart.getDate() + 5)
    return {
      label: `${bucketStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
      start: bucketStart,
      end: bucketEnd,
    }
  })
}

function isInsidePeriod(date, period) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return true
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (period === 'day') return diff <= 24 * 60 * 60 * 1000
  if (period === 'week') return diff <= 7 * 24 * 60 * 60 * 1000
  return diff <= 30 * 24 * 60 * 60 * 1000
}

function buildLinePath(values, width, height, padding) {
  const max = Math.max(...values, 1)
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0

  return values.map((value, index) => {
    const x = padding + (stepX * index)
    const y = height - padding - ((value / max) * (height - padding * 2))
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

function buildAreaPath(values, width, height, padding) {
  const line = buildLinePath(values, width, height, padding)
  const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0
  const lastX = padding + (stepX * (values.length - 1))
  return `${line} L ${lastX} ${height - padding} L ${padding} ${height - padding} Z`
}

function MiniDonut({ approved, pending, rejected }) {
  const total = approved + pending + rejected || 1
  const approvedAngle = (approved / total) * 360
  const pendingAngle = approvedAngle + (pending / total) * 360
  const background = `conic-gradient(
    rgba(62, 207, 142, 0.95) 0deg ${approvedAngle}deg,
    rgba(245, 200, 66, 0.95) ${approvedAngle}deg ${pendingAngle}deg,
    rgba(224, 92, 126, 0.95) ${pendingAngle}deg 360deg
  )`

  return (
    <div className={styles.donutWrap}>
      <div className={styles.donutChart} style={{ background }}>
        <div className={styles.donutHole}>
          <strong>{approved + pending + rejected}</strong>
          <span>fluxos</span>
        </div>
      </div>
    </div>
  )
}

function ClientBars({ clients }) {
  const highest = clients[0]?.totalUsd || 1

  return (
    <div className={styles.chartList}>
      {clients.map((client) => {
        const width = Math.max(18, (client.totalUsd / highest) * 100)

        return (
          <div key={client.id} className={styles.chartRow}>
            <div className={styles.chartRowHead}>
              <span>{client.name}</span>
              <strong>{formatCompactUSD(client.totalUsd)}</strong>
            </div>
            <div className={styles.chartTrack}>
              <div className={styles.chartFill} style={{ width: `${width}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TrendChart({ requests, period }) {
  const buckets = useMemo(() => buildBuckets(period), [period])
  const series = useMemo(() => {
    return buckets.map((bucket) => {
      const bucketItems = requests.filter((item) => {
        const date = item.createdAtDate
        return date >= bucket.start && date < bucket.end
      })

      const deposits = bucketItems
        .filter((item) => item.type === 'deposit')
        .reduce((sum, item) => sum + (Number(item.numericAmount) || 0), 0)

      const withdraws = bucketItems
        .filter((item) => item.type === 'withdraw')
        .reduce((sum, item) => sum + (Number(item.numericAmount) || 0), 0)

      return {
        label: bucket.label,
        deposits,
        withdraws,
      }
    })
  }, [buckets, requests])

  const width = 320
  const height = 160
  const padding = 18
  const deposits = series.map((item) => item.deposits)
  const withdraws = series.map((item) => item.withdraws)
  const maxValue = Math.max(...deposits, ...withdraws, 1)

  return (
    <div className={styles.trendCard}>
      <div className={styles.trendHeader}>
        <div>
          <span className={styles.analyticsKicker}>Fluxo temporal</span>
          <strong className={styles.trendTitle}>Entradas x Saídas</strong>
        </div>
        <span className={styles.trendHint}>Base: {period === 'day' ? '24h' : period === 'week' ? '7 dias' : '30 dias'}</span>
      </div>

      <svg className={styles.trendSvg} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - padding - (ratio * (height - padding * 2))
          return <line key={ratio} x1={padding} y1={y} x2={width - padding} y2={y} className={styles.trendGridLine} />
        })}

        <path d={buildAreaPath(deposits, width, height, padding)} className={styles.depositArea} />
        <path d={buildAreaPath(withdraws, width, height, padding)} className={styles.withdrawArea} />
        <path d={buildLinePath(deposits, width, height, padding)} className={styles.depositLine} />
        <path d={buildLinePath(withdraws, width, height, padding)} className={styles.withdrawLine} />

        {series.map((item, index) => {
          const stepX = series.length > 1 ? (width - padding * 2) / (series.length - 1) : 0
          const x = padding + (stepX * index)
          const depositY = height - padding - ((item.deposits / maxValue) * (height - padding * 2))
          const withdrawY = height - padding - ((item.withdraws / maxValue) * (height - padding * 2))

          return (
            <g key={item.label}>
              <circle cx={x} cy={depositY} r="3.5" className={styles.depositPoint} />
              <circle cx={x} cy={withdrawY} r="3.5" className={styles.withdrawPoint} />
            </g>
          )
        })}
      </svg>

      <div className={styles.trendLabels}>
        {series.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>

      <div className={styles.trendLegend}>
        <span><i className={`${styles.legendDot} ${styles.legendApproved}`} /> Entradas</span>
        <span><i className={`${styles.legendDot} ${styles.legendRejected}`} /> Saídas</span>
      </div>
    </div>
  )
}

function AnalyticsSection({
  clients,
  clientStatus,
  totalPending,
  totalApproved,
  totalRejected,
  scopedRequests,
  period,
}) {
  const clientStats = useMemo(() => {
    const rows = clients
      .map((client) => ({
        id: client.id,
        name: client.name,
        totalUsd: client.wallets.reduce((sum, wallet) => {
          if (wallet.symbol === 'USD') return sum + (Number(wallet.native) || 0)
          return sum + ((Number(wallet.native) || 0) * 0.2)
        }, 0),
        status: client.status,
      }))
      .sort((a, b) => b.totalUsd - a.totalUsd)

    return {
      topClients: rows.slice(0, 5),
      totalClients: clients.length,
      activeClients: rows.filter((client) => client.status === 'active').length,
      pendingClients: rows.filter((client) => client.status === 'pending').length,
      suspendedClients: rows.filter((client) => client.status === 'suspended').length,
      totalAumUsd: rows.reduce((sum, item) => sum + item.totalUsd, 0),
    }
  }, [clients])

  const operationStats = useMemo(() => {
    const totalVolume = scopedRequests.reduce((sum, item) => sum + (Number(item.numericAmount) || 0), 0)
    const resolvedRequests = scopedRequests.filter((item) => item.status !== 'pending')
    const resolvedVolume = resolvedRequests.reduce((sum, item) => sum + (Number(item.numericAmount) || 0), 0)
    const avgTicket = scopedRequests.length ? totalVolume / scopedRequests.length : 0
    const estimatedCost = resolvedVolume * 0.008
    const approvalRate = resolvedRequests.length
      ? (resolvedRequests.filter((item) => item.status === 'approved').length / resolvedRequests.length) * 100
      : 0

    return {
      totalVolume,
      resolvedVolume,
      avgTicket,
      estimatedCost,
      approvalRate,
    }
  }, [scopedRequests])

  return (
    <>
      <section className={styles.analyticsGrid}>
        <article className={`${styles.analyticsCard} corner-box`}>
          <div className={styles.analyticsHeader}>
            <span className={styles.analyticsKicker}>Clientes</span>
            <strong className={styles.analyticsValue}>{clientStats.totalClients}</strong>
          </div>
          <p className={styles.analyticsText}>
            {clientStatus === 'ready'
              ? `Base real carregada do Firestore com carteira consolidada de ${formatCompactUSD(clientStats.totalAumUsd)}.`
              : clientStatus === 'permission-denied'
                ? 'O Firestore bloqueou a leitura dos clientes para o admin atual. Ajuste as regras para liberar a visão consolidada.'
                : clientStatus === 'missing-config'
                  ? 'Firebase ainda não está configurado neste ambiente para mostrar a base real de clientes.'
                  : 'Não foi possível carregar os clientes reais agora. O card segue pronto para sincronizar assim que o acesso voltar.'}
          </p>
          <ClientBars clients={clientStats.topClients} />
          <div className={styles.analyticsFooter}>
            <span>Ativos: {clientStats.activeClients}</span>
            <span>Pendentes: {clientStats.pendingClients}</span>
            <span>Suspensos: {clientStats.suspendedClients}</span>
          </div>
        </article>

        <article className={`${styles.analyticsCard} corner-box`}>
          <div className={styles.analyticsHeader}>
            <span className={styles.analyticsKicker}>Custos</span>
            <strong className={styles.analyticsValue}>{formatCompactBRL(operationStats.estimatedCost * 5.1)}</strong>
          </div>
          <p className={styles.analyticsText}>
            Estimativa operacional baseada nas solicitações visíveis no período selecionado.
          </p>
          <div className={styles.metricGrid}>
            <div className={styles.metricBox}>
              <span>Custo estimado</span>
              <strong>{formatCompactUSD(operationStats.estimatedCost)}</strong>
            </div>
            <div className={styles.metricBox}>
              <span>Ticket médio</span>
              <strong>{formatCompactUSD(operationStats.avgTicket)}</strong>
            </div>
            <div className={styles.metricBox}>
              <span>Volume resolvido</span>
              <strong>{formatCompactUSD(operationStats.resolvedVolume)}</strong>
            </div>
            <div className={styles.metricBox}>
              <span>Aprovação</span>
              <strong>{formatPercent(operationStats.approvalRate)}</strong>
            </div>
          </div>
        </article>

        <article className={`${styles.analyticsCard} corner-box`}>
          <div className={styles.analyticsHeader}>
            <span className={styles.analyticsKicker}>Geral</span>
            <strong className={styles.analyticsValue}>{formatCompactUSD(operationStats.totalVolume)}</strong>
          </div>
          <p className={styles.analyticsText}>
            Panorama operacional filtrado por período, com distribuição entre pendências, aprovações e recusas.
          </p>
          <div className={styles.overviewWrap}>
            <MiniDonut approved={totalApproved} pending={totalPending} rejected={totalRejected} />
            <div className={styles.legendList}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendApproved}`} />
                <span>Aprovadas</span>
                <strong>{totalApproved}</strong>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendPending}`} />
                <span>Pendentes</span>
                <strong>{totalPending}</strong>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.legendRejected}`} />
                <span>Recusadas</span>
                <strong>{totalRejected}</strong>
              </div>
            </div>
          </div>
        </article>
      </section>

      <TrendChart requests={scopedRequests} period={period} />
    </>
  )
}

function FilterBar({
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  minAmount,
  onMinAmountChange,
  period,
  onPeriodChange,
  filteredCount,
  totalCount,
}) {
  return (
    <section className={`${styles.filterPanel} corner-box`}>
      <div className={styles.filterPanelTop}>
        <div>
          <span className={styles.analyticsKicker}>Filtros da operação</span>
          <strong className={styles.filterPanelTitle}>Inbox e gráficos</strong>
        </div>
        <span className={styles.filterPanelHint}>
          {filteredCount} de {totalCount} solicitações visíveis
        </span>
      </div>

      <div className={styles.filterGrid}>
        <label className={styles.filterField}>
          <span>Cliente</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            placeholder="Buscar por nome ou e-mail"
          />
        </label>

        <label className={styles.filterField}>
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
            <option value="all">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="approved">Aprovadas</option>
            <option value="rejected">Recusadas</option>
          </select>
        </label>

        <label className={styles.filterField}>
          <span>Valor mínimo</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={minAmount}
            onChange={(event) => onMinAmountChange(event.target.value)}
            placeholder="0,00"
          />
        </label>

        <label className={styles.filterField}>
          <span>Período do gráfico</span>
          <div className={styles.segmentedControl}>
            {[
              { value: 'day', label: 'Dia' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mês' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                className={`${styles.segmentBtn} ${period === option.value ? styles.segmentBtnActive : ''}`}
                onClick={() => onPeriodChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </label>
      </div>
    </section>
  )
}

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

      <div
        className={styles.emailBody}
        dangerouslySetInnerHTML={{ __html: email.body }}
      />

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
              onChange={(event) => setReason(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleConfirmReject()}
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

export default function AdminPage() {
  const { pendingRequests, resolvedRequests, approveRequest, rejectRequest } = useWorkspace()
  const toast = useToast()
  const [clientsState, setClientsState] = useState({
    loading: true,
    status: 'loading',
    clients: [],
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [minAmount, setMinAmount] = useState('')
  const [period, setPeriod] = useState('week')

  useEffect(() => {
    let active = true

    loadAdminClients().then((result) => {
      if (!active) return
      setClientsState({
        loading: false,
        status: result.status,
        clients: result.clients,
      })
    })

    return () => {
      active = false
    }
  }, [])

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
    numericAmount: req.amount,
    createdAtDate: normalizeDate(req.createdAt, req.createdAtLabel),
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
    numericAmount: req.amount,
    createdAtDate: normalizeDate(req.createdAt, req.createdAtLabel),
  }))

  const allEmails = useMemo(() => [...pendingEmails, ...historyEmails], [historyEmails, pendingEmails])

  const filteredEmails = useMemo(() => {
    const minValue = Number(minAmount) || 0
    const search = searchTerm.trim().toLowerCase()

    return allEmails.filter((email) => {
      const matchSearch = !search
        || email.from.toLowerCase().includes(search)
        || email.subject.toLowerCase().includes(search)
      const matchStatus = statusFilter === 'all' || email.status === statusFilter
      const matchValue = (Number(email.numericAmount) || 0) >= minValue
      return matchSearch && matchStatus && matchValue
    })
  }, [allEmails, minAmount, searchTerm, statusFilter])

  const scopedRequests = useMemo(
    () => filteredEmails.filter((item) => isInsidePeriod(item.createdAtDate, period)),
    [filteredEmails, period],
  )

  const filteredPendingEmails = useMemo(
    () => filteredEmails.filter((item) => item.status === 'pending'),
    [filteredEmails],
  )

  const filteredHistoryEmails = useMemo(
    () => filteredEmails.filter((item) => item.status !== 'pending'),
    [filteredEmails],
  )

  const totalPending = scopedRequests.filter((item) => item.status === 'pending').length
  const totalApproved = scopedRequests.filter((item) => item.status === 'approved').length
  const totalRejected = scopedRequests.filter((item) => item.status === 'rejected').length

  async function handleApprove(requestId) {
    const email = pendingEmails.find((item) => item.requestId === requestId)
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
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>Painel do Administrador</h2>
          <span className={styles.pageSubtitle}>Inbox de solicitações pendentes e visão analítica da operação</span>
        </div>
        <span className={styles.adminBadge}>⚙ Admin</span>
      </header>

      <div className={styles.content}>
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

        <FilterBar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          minAmount={minAmount}
          onMinAmountChange={setMinAmount}
          period={period}
          onPeriodChange={setPeriod}
          filteredCount={filteredEmails.length}
          totalCount={allEmails.length}
        />

        <AnalyticsSection
          clients={clientsState.clients}
          clientStatus={clientsState.status}
          totalPending={totalPending}
          totalApproved={totalApproved}
          totalRejected={totalRejected}
          scopedRequests={scopedRequests}
          period={period}
        />

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>
              Aguardando avaliação
              {filteredPendingEmails.length > 0 && ` (${filteredPendingEmails.length})`}
            </span>
          </div>

          {filteredPendingEmails.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📭</span>
              <span className={styles.emptyTitle}>Nenhuma pendência com os filtros atuais</span>
              <p className={styles.emptyDesc}>
                Ajuste cliente, status ou valor mínimo para encontrar outras solicitações.
              </p>
            </div>
          ) : (
            filteredPendingEmails.map((email) => (
              <EmailCard
                key={email.id}
                email={email}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>

        {filteredHistoryEmails.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>Histórico de aprovações</span>
            </div>
            {filteredHistoryEmails.map((email) => (
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
