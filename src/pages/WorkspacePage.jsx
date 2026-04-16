import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadWorkspaceData } from '../lib/firestoreService.js'
import { useAuth } from '../context/AuthContext.jsx'
import styles from './Dashboard.module.css'

const pageMeta = {
  home: {
    title: 'Dashboard',
    subtitle: 'Saldo, operacoes e historico recente em um painel direto e elegante.',
  },
  transactions: {
    title: 'Transacoes',
    subtitle: 'Consulte entradas, saidas e operacoes com status em tempo real.',
  },
  wallets: {
    title: 'Carteiras',
    subtitle: 'Veja distribuicao de ativos e saldo estimado em USD.',
  },
  cards: {
    title: 'Cartoes',
    subtitle: 'Gerencie cartoes fisicos e virtuais da conta.',
  },
  settings: {
    title: 'Configuracoes',
    subtitle: 'Defina preferencias da conta e acompanhe os controles de seguranca em um unico lugar.',
  },
}

const txIcon = {
  receive: { color: 'var(--green)', bg: 'rgba(62,207,142,0.12)', symbol: 'v' },
  send: { color: 'var(--red)', bg: 'rgba(224,92,126,0.12)', symbol: '^' },
  exchange: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', symbol: '<>' },
}

function formatSourceMessage(status) {
  if (status === 'missing-config') {
    return 'Firebase ainda nao foi configurado. Preencha as variaveis VITE_FIREBASE_* para usar dados reais.'
  }

  if (status === 'permission-denied') {
    return 'As rules atuais do Firestore bloqueiam leitura e escrita. A interface esta usando dados de exemplo.'
  }

  if (status === 'error') {
    return 'Nao foi possivel carregar os dados do Firestore. A interface caiu para o modo de exemplo.'
  }

  return null
}

function InfoBanner({ message }) {
  if (!message) {
    return null
  }

  return (
    <section className={`${styles.heroCard} corner-box`} style={{ padding: '18px 24px' }}>
      <div className={styles.heroLeft}>
        <span className={styles.heroLabel}>Status do Firebase</span>
        <div className={styles.statLabel} style={{ fontSize: '0.88rem', color: 'var(--light-main)' }}>
          {message}
        </div>
      </div>
    </section>
  )
}

function HeroPanel({ title, subtitle, userEmail, loading }) {
  return (
    <section className={`${styles.heroCard} corner-box`}>
      <div className={styles.heroLeft}>
        <span className={styles.heroLabel}>{title}</span>
        <div className={styles.heroHeadline}>
          {loading ? 'Sincronizando seu workspace financeiro.' : title}
        </div>
        <p className={styles.heroDescription}>
          {subtitle}
        </p>
        <div className={styles.heroMeta}>
          <div className={styles.heroBadge}>
            {userEmail || 'Modo demonstracao'}
          </div>
        </div>
      </div>
    </section>
  )
}

function SectionCard({ title, children }) {
  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{title}</h3>
      {children}
    </section>
  )
}

function DashboardSummary({ wallets, exchangeRates, transactions }) {
  const usdcWallet = wallets.find((wallet) => wallet.symbol === 'USDC') ?? wallets[0]
  const usdcBrl = exchangeRates.find((rate) => rate.pair === 'USDC/BRL') ?? exchangeRates[0]
  const positiveTransactions = transactions.filter((item) => item.amount?.startsWith('+')).length
  const variation = positiveTransactions > Math.floor(transactions.length / 2) ? '+0.18%' : '+0.05%'
  const stableLabel = positiveTransactions > 1 ? 'Fluxo positivo' : 'Movimento estavel'

  return (
    <div className={styles.dashboardStats}>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentGreen} corner-box`}>
        <span className={styles.dashboardStatLabel}>Saldo USDC</span>
        <div className={styles.dashboardStatValue}>$ {Number(usdcWallet?.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        <span className={styles.dashboardStatHint}>~ R$ {(Number(usdcWallet?.usd || 0) * 5.08).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
      </div>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentCyan} corner-box`}>
        <span className={styles.dashboardStatLabel}>Cotacao USD/BRL</span>
        <div className={styles.dashboardStatValue}>{usdcBrl?.value || 'R$ 5,08'}</div>
        <span className={styles.dashboardStatHint}>{usdcBrl?.change || '+0,32% hoje'}</span>
      </div>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentBlue} corner-box`}>
        <span className={styles.dashboardStatLabel}>Variacao 24h</span>
        <div className={styles.dashboardStatValue}>{variation}</div>
        <span className={styles.dashboardStatHint}>{stableLabel}</span>
      </div>
    </div>
  )
}

function DashboardActions() {
  const actions = [
    { id: 'deposit', label: 'Depositar', className: styles.actionGreen },
    { id: 'withdraw', label: 'Sacar', className: styles.actionOrange },
    { id: 'statement', label: 'Extrato', className: styles.actionBlue },
  ]

  return (
    <div className={styles.dashboardActions}>
      {actions.map((action) => (
        <button key={action.id} className={`${styles.dashboardActionBtn} ${action.className} corner-box`} type="button">
          {action.label}
        </button>
      ))}
    </div>
  )
}

function WalletList({ wallets }) {
  return (
    <div className={styles.walletList}>
      {wallets.map((wallet) => (
        <div key={wallet.id} className={`${styles.walletItem} corner-box`}>
          <div className={styles.walletSymbolWrap}>
            <span className={styles.walletSymbol} style={{ background: `${wallet.color}20`, color: wallet.color }}>
              {wallet.symbol}
            </span>
          </div>
          <div className={styles.walletInfo}>
            <span className={styles.walletName}>{wallet.name}</span>
            <span className={styles.walletAmount}>{wallet.amount}</span>
          </div>
          <div className={styles.walletRight}>
            <span className={styles.walletUsd}>~ ${Number(wallet.usd || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            <span className={`${styles.walletChange} ${wallet.up ? styles.up : styles.down}`}>{wallet.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function TransactionsTable({ transactions }) {
  return (
    <div className={`${styles.txTable} corner-box`}>
      <div className={styles.txHead}>
        <span>Transacao</span>
        <span>Data</span>
        <span>Status</span>
        <span style={{ textAlign: 'right' }}>Valor</span>
      </div>
      <div className={styles.txBody}>
        {transactions.map((tx) => {
          const meta = txIcon[tx.type] ?? txIcon.exchange
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
              <span className={`${styles.txStatus} ${styles[tx.status] ?? ''}`}>
                <span className={styles.statusDot} />
                {tx.status === 'pending' ? 'Pendente' : 'Concluido'}
              </span>
              <span className={`${styles.txAmount} ${tx.amount?.startsWith('+') ? styles.up : styles.down}`}>{tx.amount}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DashboardTransactions({ transactions }) {
  const rows = transactions.map((tx, index) => {
    const amount = tx.amount || ''
    const numericAmount = amount.replace(/[^\d.,-]/g, '')
    const kindMap = {
      receive: 'Deposito',
      send: 'Saque',
      exchange: 'Taxa',
    }
    const noteMap = {
      receive: 'Via Binance P2P',
      send: 'Saque presencial',
      exchange: 'Aplicacao operacional',
    }

    return {
      id: tx.id,
      date: tx.time.includes(',') ? `0${index + 1}/03/2026` : tx.time,
      type: kindMap[tx.type] ?? 'Movimento',
      value: numericAmount || tx.amount,
      status: tx.status === 'pending' ? 'Em analise' : 'Confirmado',
      note: tx.from || noteMap[tx.type] || 'Sem observacao',
      positive: amount.startsWith('+'),
    }
  })

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Transacoes Recentes</h3>
      <div className={`${styles.dashboardTable} corner-box`}>
        <div className={styles.dashboardTableHead}>
          <span>Data</span>
          <span>Tipo</span>
          <span>Valor USDC</span>
          <span>Status</span>
          <span>Observacao</span>
        </div>
        <div className={styles.dashboardTableBody}>
          {rows.map((row) => (
            <div key={row.id} className={styles.dashboardTableRow}>
              <span>{row.date}</span>
              <span>{row.type}</span>
              <span className={row.positive ? styles.dashboardPositive : styles.dashboardNegative}>{row.value}</span>
              <span>{row.status}</span>
              <span>{row.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SimpleList({ items, primaryKey = 'title', secondaryKey = 'description' }) {
  return (
    <div className={styles.walletList}>
      {items.map((item) => (
        <div key={item.id} className={`${styles.walletItem} corner-box`}>
          <div className={styles.walletInfo}>
            <span className={styles.walletAmount}>{item[primaryKey]}</span>
            <span className={styles.walletName}>{item[secondaryKey]}</span>
          </div>
          {item.value ? <div className={styles.walletUsd}>{item.value}</div> : null}
          {item.status ? <div className={styles.walletUsd}>{item.status}</div> : null}
          {item.change ? <div className={styles.walletUsd}>{item.change}</div> : null}
        </div>
      ))}
    </div>
  )
}

export default function WorkspacePage({ pageKey }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [state, setState] = useState({
    loading: true,
    wallets: { data: [], status: 'loading' },
    transactions: { data: [], status: 'loading' },
    cards: { data: [], status: 'loading' },
    exchangeRates: { data: [], status: 'loading' },
    securityEvents: { data: [], status: 'loading' },
    settings: { data: [], status: 'loading' },
  })

  useEffect(() => {
    let active = true

    loadWorkspaceData(user?.uid).then((result) => {
      if (!active) {
        return
      }

      setState({
        loading: false,
        ...result,
      })
    })

    return () => {
      active = false
    }
  }, [user?.uid])

  const meta = pageMeta[pageKey] ?? pageMeta.home
  const bannerMessage = useMemo(() => (
    formatSourceMessage(state.transactions.status) ?? formatSourceMessage(state.wallets.status)
  ), [state.transactions.status, state.wallets.status])

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>{meta.title}</h2>
          <span className={styles.pageDate}>{dateLabel}</span>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.topAvatar}>
            {(user?.displayName || user?.email || 'CB').slice(0, 2).toUpperCase()}
          </div>
          <button className={styles.viewAllBtn} onClick={handleLogout} type="button">
            Sair
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <HeroPanel
          title={meta.title}
          subtitle={meta.subtitle}
          userEmail={user?.email}
          loading={state.loading}
        />

        <InfoBanner message={bannerMessage} />

        {pageKey === 'home' && (
          <>
            <DashboardSummary
              wallets={state.wallets.data}
              exchangeRates={state.exchangeRates.data}
              transactions={state.transactions.data}
            />
            <DashboardActions />
            <DashboardTransactions transactions={state.transactions.data.slice(0, 5)} />
          </>
        )}

        {pageKey === 'transactions' && (
          <SectionCard title="Historico de Transacoes">
            <TransactionsTable transactions={state.transactions.data} />
          </SectionCard>
        )}

        {pageKey === 'wallets' && (
          <SectionCard title="Seus Ativos">
            <WalletList wallets={state.wallets.data} />
          </SectionCard>
        )}

        {pageKey === 'cards' && (
          <SectionCard title="Cartoes">
            <SimpleList items={state.cards.data} primaryKey="brand" secondaryKey="limit" />
          </SectionCard>
        )}

        {pageKey === 'settings' && (
          <>
            <SectionCard title="Preferencias">
              <SimpleList items={state.settings.data} primaryKey="label" secondaryKey="value" />
            </SectionCard>
            <SectionCard title="Seguranca da Conta">
              <SimpleList items={state.securityEvents.data} />
            </SectionCard>
          </>
        )}
      </div>
    </div>
  )
}
