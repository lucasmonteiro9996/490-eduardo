import { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import styles from './Dashboard.module.css'

const BALANCES = [
  { symbol: 'BRL', name: 'Real brasileiro', amount: 'R$ 18.600,00', usd: '3,720.00', change: '+0.4%', up: true, color: '#3ecf8e' },
  { symbol: 'USD', name: 'Dólar americano', amount: '$ 9,450.00', usd: '9,450.00', change: '+0.2%', up: true, color: '#4a7fdb' },
]

const TRANSACTIONS = [
  { id: 1, type: 'receive', label: 'Depósito em dólar', from: 'Transferência internacional', amount: '+$2,500.00', time: 'Hoje, 14:32', status: 'completed' },
  { id: 2, type: 'send', label: 'Transferência via PIX', from: 'Para: João Silva', amount: '-R$850,00', time: 'Hoje, 11:15', status: 'completed' },
  { id: 3, type: 'exchange', label: 'Câmbio USD → BRL', from: 'Taxa: 0.5%', amount: '+R$3.012,00', time: 'Ontem, 18:44', status: 'completed' },
  { id: 4, type: 'send', label: 'Pagamento de conta de luz', from: 'Energisa SP', amount: '-R$214,50', time: 'Ontem, 09:20', status: 'completed' },
  { id: 5, type: 'receive', label: 'Depósito em real', from: 'Boleto bancário', amount: '+R$1.200,00', time: '13/04, 16:00', status: 'completed' },
  { id: 6, type: 'send', label: 'Transferência internacional', from: 'Para: conta em Miami', amount: '-$1,200.00', time: '12/04, 21:10', status: 'pending' },
  { id: 7, type: 'exchange', label: 'Câmbio BRL → USD', from: 'Taxa: 0.5%', amount: '+$420.00', time: '11/04, 08:55', status: 'completed' },
]

const QUICK_ACTIONS = [
  {
    id: 'send',
    label: 'Enviar',
    color: '#4a7fdb',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    ),
  },
  {
    id: 'receive',
    label: 'Receber',
    color: '#3ecf8e',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v14M5 9l7 7 7-7" />
        <path d="M3 20h18" />
      </svg>
    ),
  },
  {
    id: 'pay',
    label: 'Pagar',
    color: '#f5c842',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 'exchange',
    label: 'Câmbio',
    color: '#a78bfa',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 0 1 4-4h14" />
        <path d="m7 23-4-4 4-4" />
        <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      </svg>
    ),
  },
  {
    id: 'pix',
    label: 'PIX',
    color: '#34d8b6',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    ),
  },
  {
    id: 'charge',
    label: 'Cobrar',
    color: '#f97316',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
]

const SPARKLINE_POINTS = [20, 35, 28, 52, 44, 60, 55, 72, 68, 85, 78, 94]

function MiniChart({ color = '#4a7fdb' }) {
  const w = 120
  const h = 40
  const max = Math.max(...SPARKLINE_POINTS)
  const min = Math.min(...SPARKLINE_POINTS)
  const pts = SPARKLINE_POINTS.map((value, index) => {
    const x = (index / (SPARKLINE_POINTS.length - 1)) * w
    const y = h - ((value - min) / (max - min)) * (h - 6) - 3
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.06" />
    </svg>
  )
}

function StatCard({ label, value, change, up, icon, color }) {
  return (
    <div className={`${styles.statCard} corner-box`}>
      <div className={styles.statTop}>
        <div className={styles.statIconWrap} style={{ background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <span className={`${styles.statChange} ${up ? styles.up : styles.down}`}>
          {up ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="m18 15-6-6-6 6" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
          {change}
        </span>
      </div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  )
}

const txIcon = {
  receive: { color: 'var(--green)', bg: 'rgba(62,207,142,0.12)', symbol: '↓' },
  send: { color: 'var(--red)', bg: 'rgba(224,92,126,0.12)', symbol: '↑' },
  exchange: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', symbol: '⇌' },
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState('home')
  const [balanceHidden, setBalanceHidden] = useState(false)
  const [activeBalance, setActiveBalance] = useState(0)

  const totalUSD = BALANCES.reduce((sum, balance) => sum + parseFloat(balance.usd.replace(',', '')), 0)

  return (
    <div className={styles.layout}>
      <Sidebar active={activeNav} onSelect={setActiveNav} />

      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h2 className={styles.pageTitle}>
              {activeNav === 'home' && 'Visão geral'}
              {activeNav === 'transactions' && 'Transações'}
              {activeNav === 'wallets' && 'Carteiras'}
              {activeNav === 'exchange' && 'Câmbio'}
              {activeNav === 'cards' && 'Cartões'}
              {activeNav === 'security' && 'Segurança'}
              {activeNav === 'settings' && 'Configurações'}
            </h2>
            <span className={styles.pageDate}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
          </div>
          <div className={styles.topbarRight}>
            <button className={styles.iconBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
            <button className={`${styles.iconBtn} ${styles.notifBtn}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className={styles.notifDot} />
            </button>
            <div className={styles.topAvatar}>LC</div>
          </div>
        </header>

        <div className={styles.content}>
          <section className={`${styles.heroCard} corner-box`}>
            <div className={styles.heroLeft}>
              <div className={styles.heroLabelRow}>
                <span className={styles.heroLabel}>Saldo total (USD)</span>
                <button className={styles.hideBtn} onClick={() => setBalanceHidden((value) => !value)}>
                  {balanceHidden ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              <div className={styles.heroValue}>
                {balanceHidden ? '••••••' : `$${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </div>
              <div className={styles.heroBadge}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m18 15-6-6-6 6" />
                </svg>
                +8.4% este mês
              </div>
            </div>
            <div className={styles.heroRight}>
              <MiniChart color="#4a7fdb" />
              <span className={styles.heroChartLabel}>Últimos 30 dias</span>
            </div>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Ações rápidas</h3>
            <div className={styles.actionsGrid}>
              {QUICK_ACTIONS.map((action) => (
                <button key={action.id} className={styles.actionBtn}>
                  <span className={styles.actionIcon} style={{ background: `${action.color}18`, color: action.color }}>
                    {action.icon}
                  </span>
                  <span className={styles.actionLabel}>{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          <div className={styles.twoCol}>
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Suas carteiras</h3>
              <div className={styles.walletList}>
                {BALANCES.map((balance, index) => (
                  <div
                    key={balance.symbol}
                    className={`${styles.walletItem} ${activeBalance === index ? styles.walletActive : ''} corner-box`}
                    onClick={() => setActiveBalance(index)}
                  >
                    <div className={styles.walletSymbolWrap}>
                      <span className={styles.walletSymbol} style={{ background: `${balance.color}20`, color: balance.color }}>
                        {balance.symbol}
                      </span>
                    </div>
                    <div className={styles.walletInfo}>
                      <span className={styles.walletName}>{balance.name}</span>
                      <span className={styles.walletAmount}>{balance.amount}</span>
                    </div>
                    <div className={styles.walletRight}>
                      <span className={styles.walletUsd}>≈ ${balance.usd}</span>
                      <span className={`${styles.walletChange} ${balance.up ? styles.up : styles.down}`}>
                        {balance.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Resumo do mês</h3>
              <div className={styles.statsGrid}>
                <StatCard
                  label="Receitas"
                  value="$7,340"
                  change="+12%"
                  up={true}
                  color="var(--green)"
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v14M5 9l7 7 7-7" />
                      <path d="M3 20h18" />
                    </svg>
                  )}
                />
                <StatCard
                  label="Despesas"
                  value="$2,180"
                  change="-5%"
                  up={false}
                  color="var(--red)"
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  )}
                />
                <StatCard
                  label="Câmbios"
                  value="14"
                  change="+3"
                  up={true}
                  color="#a78bfa"
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 1l4 4-4 4" />
                      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                      <path d="m7 23-4-4 4-4" />
                      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    </svg>
                  )}
                />
                <StatCard
                  label="Economia"
                  value="$5,160"
                  change="+18%"
                  up={true}
                  color="#f5c842"
                  icon={(
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 6v4l3 3" />
                    </svg>
                  )}
                />
              </div>
            </section>
          </div>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Transações recentes</h3>
              <button className={styles.viewAllBtn}>
                Ver todas
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>
            </div>

            <div className={`${styles.txTable} corner-box`}>
              <div className={styles.txHead}>
                <span>Transação</span>
                <span>Data</span>
                <span>Status</span>
                <span style={{ textAlign: 'right' }}>Valor</span>
              </div>
              <div className={styles.txBody}>
                {TRANSACTIONS.map((transaction) => {
                  const meta = txIcon[transaction.type]
                  return (
                    <div key={transaction.id} className={styles.txRow}>
                      <div className={styles.txMain}>
                        <span className={styles.txIconWrap} style={{ background: meta.bg, color: meta.color }}>
                          {meta.symbol}
                        </span>
                        <div className={styles.txInfo}>
                          <span className={styles.txLabel}>{transaction.label}</span>
                          <span className={styles.txFrom}>{transaction.from}</span>
                        </div>
                      </div>
                      <span className={styles.txTime}>{transaction.time}</span>
                      <span className={`${styles.txStatus} ${styles[transaction.status]}`}>
                        <span className={styles.statusDot} />
                        {transaction.status === 'completed' ? 'Concluído' : 'Pendente'}
                      </span>
                      <span className={`${styles.txAmount} ${transaction.amount.startsWith('+') ? styles.up : styles.down}`}>
                        {transaction.amount}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
