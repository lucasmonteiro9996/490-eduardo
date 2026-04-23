import { useState, useMemo } from 'react'
import { MOCK_CLIENTS, getClientTotalUSD, formatNative } from '../data/mockClients.js'
import styles from './AdminClients.module.css'

// ── Ícone de tipo de transação ────────────────────────────────────────────

const txMeta = {
  receive:  { color: 'var(--green)', bg: 'rgba(62,207,142,0.12)',   symbol: '↓' },
  send:     { color: 'var(--red)',   bg: 'rgba(224,92,126,0.12)',   symbol: '↑' },
  exchange: { color: '#a78bfa',      bg: 'rgba(167,139,250,0.12)',  symbol: '⇌' },
}

const statusLabel = {
  completed: 'Concluído',
  pending:   'Pendente',
  rejected:  'Recusada',
}

const tierColor = {
  Standard:  { text: 'var(--text-soft)',  bg: 'rgba(232,225,219,0.08)' },
  Premium:   { text: '#4a7fdb',           bg: 'rgba(74,127,219,0.12)' },
  Corporate: { text: 'var(--yellow)',     bg: 'rgba(245,200,66,0.12)' },
}

const accountStatus = {
  active:    { label: 'Ativa',      color: 'var(--green)', dot: '#3ecf8e' },
  suspended: { label: 'Suspensa',   color: 'var(--red)',   dot: '#e05c7e' },
  pending:   { label: 'Pendente',   color: 'var(--yellow)',dot: '#f5c842' },
}

// ── Sparkline mini-chart ──────────────────────────────────────────────────

function Sparkline({ values = [], color = '#4a7fdb' }) {
  if (values.length < 2) return null
  const w = 80, h = 28
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 5) - 3
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.07" />
    </svg>
  )
}

// ── Detalhe de cliente ────────────────────────────────────────────────────

function ClientDetail({ client, onClose }) {
  const [txFilter, setTxFilter] = useState('all')

  const filteredTx = useMemo(() => {
    if (txFilter === 'all') return client.transactions
    return client.transactions.filter((t) => t.type === txFilter)
  }, [client.transactions, txFilter])

  const totalIn  = client.transactions.filter(t => t.native > 0).reduce((s, t) => s + Math.abs(t.native), 0)
  const totalOut = client.transactions.filter(t => t.native < 0).reduce((s, t) => s + Math.abs(t.native), 0)
  const status   = accountStatus[client.status] ?? accountStatus.pending
  const tier     = tierColor[client.tier]       ?? tierColor.Standard

  const sparkValues = [20, 34, 28, 55, 48, 66, 58, 74, 70, 88, 80, 95]

  return (
    <div className={styles.detailOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.detailPanel}>

        {/* Header do painel */}
        <div className={styles.detailHeader}>
          <div className={styles.detailAvatarWrap}>
            <div className={styles.detailAvatar} style={{ background: `${client.avatarColor}22`, color: client.avatarColor, border: `1.5px solid ${client.avatarColor}44` }}>
              {client.avatarInitials}
            </div>
            <span className={styles.statusIndicator} style={{ background: status.dot }} title={status.label} />
          </div>

          <div className={styles.detailMeta}>
            <div className={styles.detailNameRow}>
              <h2 className={styles.detailName}>{client.name}</h2>
              <span className={styles.tierBadge} style={{ color: tier.text, background: tier.bg }}>
                {client.tier}
              </span>
            </div>
            <span className={styles.detailEmail}>{client.email}</span>
            <div className={styles.detailTags}>
              <span className={styles.detailTag}>{client.phone}</span>
              <span className={styles.detailTag}>Desde {client.joinedAt}</span>
              <span className={styles.detailTag} style={{ color: status.color }}>● {status.label}</span>
            </div>
          </div>

          <button className={styles.closeBtn} onClick={onClose} type="button" aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats de saldo */}
        <div className={styles.balanceGrid}>
          {client.wallets.map((wallet) => (
            <div key={wallet.symbol} className={styles.balanceCard}>
              <div className={styles.balanceTop}>
                <span className={styles.balanceSymbol} style={{ background: `${wallet.color}20`, color: wallet.color }}>
                  {wallet.symbol}
                </span>
                <Sparkline values={sparkValues} color={wallet.color} />
              </div>
              <div className={styles.balanceAmount}>
                {formatNative(wallet.native, wallet.symbol)}
              </div>
              <div className={styles.balanceName}>{wallet.name}</div>
            </div>
          ))}

          <div className={styles.balanceCard}>
            <div className={styles.balanceTop}>
              <span className={styles.balanceSymbol} style={{ background: 'rgba(245,200,66,0.15)', color: '#f5c842' }}>
                ≈
              </span>
            </div>
            <div className={styles.balanceAmount}>
              ${getClientTotalUSD(client).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className={styles.balanceName}>Total em USD</div>
          </div>

          <div className={styles.balanceCard} style={{ borderColor: 'rgba(62,207,142,0.18)' }}>
            <div className={styles.balanceTop}>
              <span className={styles.balanceSymbol} style={{ background: 'rgba(62,207,142,0.1)', color: 'var(--green)' }}>↓</span>
            </div>
            <div className={styles.balanceAmount} style={{ color: 'var(--green)' }}>
              {client.transactions.filter(t => t.native > 0).length}
            </div>
            <div className={styles.balanceName}>Entradas</div>
          </div>

          <div className={styles.balanceCard} style={{ borderColor: 'rgba(224,92,126,0.18)' }}>
            <div className={styles.balanceTop}>
              <span className={styles.balanceSymbol} style={{ background: 'rgba(224,92,126,0.1)', color: 'var(--red)' }}>↑</span>
            </div>
            <div className={styles.balanceAmount} style={{ color: 'var(--red)' }}>
              {client.transactions.filter(t => t.native < 0).length}
            </div>
            <div className={styles.balanceName}>Saídas</div>
          </div>
        </div>

        {/* Histórico de transações */}
        <div className={styles.txSection}>
          <div className={styles.txSectionHeader}>
            <span className={styles.txSectionTitle}>Histórico de transações</span>
            <div className={styles.txFilters}>
              {['all', 'receive', 'send', 'exchange'].map((f) => (
                <button
                  key={f}
                  className={`${styles.txFilterBtn} ${txFilter === f ? styles.txFilterActive : ''}`}
                  onClick={() => setTxFilter(f)}
                  type="button"
                >
                  {f === 'all' ? 'Todas' : f === 'receive' ? 'Entradas' : f === 'send' ? 'Saídas' : 'Câmbios'}
                </button>
              ))}
            </div>
          </div>

          {filteredTx.length === 0 ? (
            <div className={styles.emptyTx}>
              <span className={styles.emptyTxIcon}>📄</span>
              <span>Nenhuma transação encontrada</span>
            </div>
          ) : (
            <div className={`${styles.txTable} corner-box`}>
              <div className={styles.txHead}>
                <span>Transação</span>
                <span>Data</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Valor</span>
              </div>
              <div className={styles.txBody}>
                {filteredTx.map((tx) => {
                  const meta = txMeta[tx.type] ?? txMeta.receive
                  return (
                    <div key={tx.id} className={styles.txRow}>
                      <div className={styles.txMain}>
                        <span className={styles.txIconWrap} style={{ background: meta.bg, color: meta.color }}>
                          {meta.symbol}
                        </span>
                        <div className={styles.txInfo}>
                          <span className={styles.txLabel}>{tx.label}</span>
                          <span className={styles.txFrom}>{tx.from}</span>
                        </div>
                      </div>
                      <span className={styles.txTime}>{tx.time}</span>
                      <span className={`${styles.txStatus} ${styles[tx.status]}`}>
                        <span className={styles.statusDot} />
                        {statusLabel[tx.status] ?? tx.status}
                      </span>
                      <span className={`${styles.txAmount} ${tx.native >= 0 ? styles.up : styles.down}`}>
                        {tx.amount}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Card de cliente na lista ──────────────────────────────────────────────

function ClientCard({ client, onClick }) {
  const totalUSD = getClientTotalUSD(client)
  const status   = accountStatus[client.status] ?? accountStatus.pending
  const tier     = tierColor[client.tier]       ?? tierColor.Standard
  const txCount  = client.transactions.length
  const lastTx   = client.transactions[0]

  return (
    <div className={styles.clientCard} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className={styles.clientCardLeft}>
        <div className={styles.clientAvatarWrap}>
          <div
            className={styles.clientAvatar}
            style={{ background: `${client.avatarColor}20`, color: client.avatarColor, border: `1.5px solid ${client.avatarColor}35` }}
          >
            {client.avatarInitials}
          </div>
          <span className={styles.clientStatusDot} style={{ background: status.dot }} />
        </div>

        <div className={styles.clientInfo}>
          <div className={styles.clientNameRow}>
            <span className={styles.clientName}>{client.name}</span>
            <span className={styles.clientTierBadge} style={{ color: tier.text, background: tier.bg }}>
              {client.tier}
            </span>
          </div>
          <span className={styles.clientEmail}>{client.email}</span>
          <span className={styles.clientMeta}>
            Desde {client.joinedAt} · {txCount} transaç{txCount === 1 ? 'ão' : 'ões'}
          </span>
        </div>
      </div>

      <div className={styles.clientCardRight}>
        <div className={styles.clientBalances}>
          {client.wallets.map((w) => (
            <div key={w.symbol} className={styles.clientBalanceItem}>
              <span className={styles.clientBalanceSymbol} style={{ color: w.color }}>{w.symbol}</span>
              <span className={styles.clientBalanceValue}>{formatNative(w.native, w.symbol)}</span>
            </div>
          ))}
        </div>

        <div className={styles.clientTotalWrap}>
          <span className={styles.clientTotalLabel}>≈ Total USD</span>
          <span className={styles.clientTotal}>
            ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className={styles.clientLastTx}>
          {lastTx ? (
            <>
              <span className={styles.clientLastTxLabel}>Última mov.</span>
              <span className={styles.clientLastTxTime}>{lastTx.time}</span>
            </>
          ) : (
            <span className={styles.clientLastTxLabel} style={{ color: 'var(--text-muted)' }}>Sem movimentações</span>
          )}
        </div>

        <div className={styles.clientArrow}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────

export default function AdminClients() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterTier, setFilterTier] = useState('all')
  const [selectedClient, setSelectedClient] = useState(null)

  const clients = useMemo(() => {
    return MOCK_CLIENTS.filter((c) => {
      const matchSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || c.status === filterStatus
      const matchTier   = filterTier   === 'all' || c.tier   === filterTier
      return matchSearch && matchStatus && matchTier
    })
  }, [search, filterStatus, filterTier])

  const totalActiveUSD = MOCK_CLIENTS
    .filter((c) => c.status === 'active')
    .reduce((s, c) => s + getClientTotalUSD(c), 0)

  const countActive    = MOCK_CLIENTS.filter((c) => c.status === 'active').length
  const countSuspended = MOCK_CLIENTS.filter((c) => c.status === 'suspended').length
  const countPending   = MOCK_CLIENTS.filter((c) => c.status === 'pending').length

  return (
    <div className={styles.main}>

      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>Gestão de Clientes</h2>
          <span className={styles.pageSubtitle}>Todas as contas cadastradas no banco</span>
        </div>
        <span className={styles.adminBadge}>⚙ Admin</span>
      </header>

      <div className={styles.content}>

        {/* Estatísticas globais */}
        <div className={`${styles.statsBar} corner-box`}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{MOCK_CLIENTS.length}</span>
            <span className={styles.statLabel}>Total de contas</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--green)' }}>{countActive}</span>
            <span className={styles.statLabel}>Contas ativas</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--yellow)' }}>{countPending}</span>
            <span className={styles.statLabel}>Aguardando KYC</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: 'var(--red)' }}>{countSuspended}</span>
            <span className={styles.statLabel}>Suspensas</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue} style={{ color: '#4a7fdb' }}>
              ${totalActiveUSD.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
            <span className={styles.statLabel}>AUM total (USD)</span>
          </div>
        </div>

        {/* Barra de filtros */}
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.searchClear} onClick={() => setSearch('')} type="button">✕</button>
            )}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status:</span>
            {['all', 'active', 'pending', 'suspended'].map((s) => (
              <button
                key={s}
                className={`${styles.filterBtn} ${filterStatus === s ? styles.filterActive : ''}`}
                onClick={() => setFilterStatus(s)}
                type="button"
              >
                {s === 'all' ? 'Todos' : s === 'active' ? 'Ativos' : s === 'pending' ? 'Pendentes' : 'Suspensos'}
              </button>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Tier:</span>
            {['all', 'Standard', 'Premium', 'Corporate'].map((t) => (
              <button
                key={t}
                className={`${styles.filterBtn} ${filterTier === t ? styles.filterActive : ''}`}
                onClick={() => setFilterTier(t)}
                type="button"
              >
                {t === 'all' ? 'Todos' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado de busca */}
        {(search || filterStatus !== 'all' || filterTier !== 'all') && (
          <div className={styles.resultsInfo}>
            <span>{clients.length} conta{clients.length !== 1 ? 's' : ''} encontrada{clients.length !== 1 ? 's' : ''}</span>
            <button
              className={styles.clearFilters}
              onClick={() => { setSearch(''); setFilterStatus('all'); setFilterTier('all') }}
              type="button"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {/* Lista de clientes */}
        <div className={styles.clientList}>
          {clients.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <span className={styles.emptyTitle}>Nenhuma conta encontrada</span>
              <p className={styles.emptyDesc}>Tente ajustar os filtros ou a busca.</p>
            </div>
          ) : (
            clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onClick={() => setSelectedClient(client)}
              />
            ))
          )}
        </div>

      </div>

      {/* Painel de detalhes do cliente */}
      {selectedClient && (
        <ClientDetail
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
        />
      )}
    </div>
  )
}
