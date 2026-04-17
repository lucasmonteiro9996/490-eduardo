import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency, useWorkspace } from '../context/WorkspaceContext.jsx'
import MoneyModal from '../components/MoneyModal.jsx'
import CreditCard from '../components/CreditCard.jsx'
import { openStatementPdf, openTransactionPdf } from '../lib/pdfExport.js'
import styles from './Dashboard.module.css'

const pageMeta = {
  home: {
    title: 'Dashboard',
    subtitle: 'Saldo, operacoes e historico recente em um painel direto e elegante.',
  },
  transactions: {
    title: 'Extrato',
    subtitle: 'Consulte entradas, saidas e exporte cada movimentacao em PDF.',
  },
  wallets: {
    title: 'Carteiras',
    subtitle: 'Veja seus saldos em Real e Dolar em um unico painel.',
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
  if (!message) return null
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
        <p className={styles.heroDescription}>{subtitle}</p>
        <div className={styles.heroMeta}>
          <div className={styles.heroBadge}>{userEmail || 'Modo demonstracao'}</div>
        </div>
      </div>
    </section>
  )
}

function SectionCard({ title, action, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function DashboardSummary({ wallets, exchangeRates, transactions }) {
  const brlWallet = wallets.find((w) => w.symbol === 'BRL') ?? wallets[0]
  const usdWallet = wallets.find((w) => w.symbol === 'USD') ?? wallets[1] ?? wallets[0]
  const usdBrl = exchangeRates.find((rate) => rate.pair === 'USD/BRL') ?? exchangeRates[0]
  const positiveTransactions = transactions.filter((item) => item.amount?.startsWith('+')).length
  const stableLabel = positiveTransactions > 1 ? 'Fluxo positivo' : 'Movimento estavel'

  return (
    <div className={styles.dashboardStats}>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentGreen} corner-box`}>
        <span className={styles.dashboardStatLabel}>Saldo em Real</span>
        <div className={styles.dashboardStatValue}>{formatCurrency(brlWallet?.native || 0, 'BRL')}</div>
        <span className={styles.dashboardStatHint}>Conta BRL</span>
      </div>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentCyan} corner-box`}>
        <span className={styles.dashboardStatLabel}>Saldo em Dolar</span>
        <div className={styles.dashboardStatValue}>{formatCurrency(usdWallet?.native || 0, 'USD')}</div>
        <span className={styles.dashboardStatHint}>Conta USD</span>
      </div>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentBlue} corner-box`}>
        <span className={styles.dashboardStatLabel}>Cotacao USD/BRL</span>
        <div className={styles.dashboardStatValue}>{usdBrl?.value || 'R$ 5,08'}</div>
        <span className={styles.dashboardStatHint}>{usdBrl?.change || '+0,32%'} {stableLabel}</span>
      </div>
    </div>
  )
}

function DashboardActions({ onDeposit, onWithdraw, onStatement }) {
  return (
    <div className={styles.dashboardActions}>
      <button className={`${styles.dashboardActionBtn} ${styles.actionGreen} corner-box`} type="button" onClick={onDeposit}>
        Depositar
      </button>
      <button className={`${styles.dashboardActionBtn} ${styles.actionOrange} corner-box`} type="button" onClick={onWithdraw}>
        Sacar
      </button>
      <button className={`${styles.dashboardActionBtn} ${styles.actionBlue} corner-box`} type="button" onClick={onStatement}>
        Extrato
      </button>
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
            <span className={styles.walletAmount}>{formatCurrency(wallet.native || 0, wallet.symbol)}</span>
          </div>
          <div className={styles.walletRight}>
            <span className={`${styles.walletChange} ${wallet.up ? styles.up : styles.down}`}>{wallet.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function StatementTable({ transactions, onExportRow, onExportAll, userName }) {
  return (
    <div className={styles.statementWrap}>
      <div className={styles.statementToolbar}>
        <div>
          <span className={styles.statementOwner}>Titular: <strong>{userName}</strong></span>
          <span className={styles.statementCount}>{transactions.length} movimentacao(oes)</span>
        </div>
        <button type="button" className={styles.viewAllBtn} onClick={onExportAll}>
          Exportar extrato completo em PDF
        </button>
      </div>
      <div className={`${styles.txTable} corner-box`}>
        <div className={styles.statementHead}>
          <span>Transacao</span>
          <span>Data</span>
          <span>Status</span>
          <span style={{ textAlign: 'right' }}>Valor</span>
          <span style={{ textAlign: 'center' }}>PDF</span>
        </div>
        <div className={styles.txBody}>
          {transactions.map((tx) => {
            const meta = txIcon[tx.type] ?? txIcon.exchange
            return (
              <div key={tx.id} className={styles.statementRow}>
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
                <button type="button" className={styles.pdfBtn} onClick={() => onExportRow(tx)}>
                  PDF
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function DashboardTransactions({ transactions }) {
  const rows = transactions.map((tx, index) => {
    const amount = tx.amount || ''
    const kindMap = { receive: 'Deposito', send: 'Saque', exchange: 'Cambio' }
    const noteMap = { receive: 'Entrada na conta', send: 'Saida da conta', exchange: 'Conversao BRL/USD' }

    return {
      id: tx.id,
      date: tx.time.includes(',') ? `0${index + 1}/04/2026` : tx.time,
      type: kindMap[tx.type] ?? 'Movimento',
      value: amount,
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
          <span>Valor</span>
          <span>Status</span>
          <span>Observacao</span>
        </div>
        <div className={styles.dashboardTableBody}>
          {rows.length === 0 ? (
            <div className={styles.dashboardTableRow}>
              <span style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(232,225,219,0.55)' }}>
                Nenhuma movimentacao ainda. Faca um deposito para comecar.
              </span>
            </div>
          ) : (
            rows.map((row) => (
              <div key={row.id} className={styles.dashboardTableRow}>
                <span>{row.date}</span>
                <span>{row.type}</span>
                <span className={row.positive ? styles.dashboardPositive : styles.dashboardNegative}>{row.value}</span>
                <span>{row.status}</span>
                <span>{row.note}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

function CardsGallery({ cards }) {
  if (!cards.length) {
    return <p className={styles.heroDescription}>Nenhum cartao cadastrado ainda.</p>
  }

  return (
    <div className={styles.cardsGallery}>
      {cards.map((card) => (
        <div key={card.id} className={styles.cardShowcase}>
          <CreditCard brand={card.brand} holder={card.holder} number={card.number} valid={card.valid} cvv={card.cvv} />
          <div className={styles.cardMeta}>
            <div>
              <span className={styles.cardMetaLabel}>Moeda</span>
              <span className={styles.cardMetaValue}>{card.currency}</span>
            </div>
            <div>
              <span className={styles.cardMetaLabel}>Limite</span>
              <span className={styles.cardMetaValue}>{card.limit}</span>
            </div>
            <div>
              <span className={styles.cardMetaLabel}>Status</span>
              <span className={`${styles.cardMetaValue} ${styles.cardStatusOk}`}>{card.status}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
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
  const workspace = useWorkspace()
  const [modal, setModal] = useState(null)

  const meta = pageMeta[pageKey] ?? pageMeta.home
  const bannerMessage = useMemo(
    () => formatSourceMessage(workspace.transactions.status) ?? formatSourceMessage(workspace.wallets.status),
    [workspace.transactions.status, workspace.wallets.status],
  )

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const userName = user?.displayName || user?.email || 'Cliente DuoBank'
  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleConfirm(payload) {
    if (modal === 'deposit') {
      workspace.deposit(payload)
    } else if (modal === 'withdraw') {
      workspace.withdraw(payload)
    }
  }

  function handleStatement() {
    navigate('/dashboard/transacoes')
  }

  function exportRowPdf(tx) {
    openTransactionPdf(tx, { owner: userName })
  }

  function exportAllPdf() {
    openStatementPdf(workspace.transactions.data, { owner: userName })
  }

  return (
    <div className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>{meta.title}</h2>
          <span className={styles.pageDate}>{dateLabel}</span>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.topAvatar}>{(user?.displayName || user?.email || 'DB').slice(0, 2).toUpperCase()}</div>
          <button className={styles.viewAllBtn} onClick={handleLogout} type="button">
            Sair
          </button>
        </div>
      </header>

      <div className={styles.content}>
        <HeroPanel title={meta.title} subtitle={meta.subtitle} userEmail={user?.email} loading={workspace.loading} />

        <InfoBanner message={bannerMessage} />

        {pageKey === 'home' && (
          <>
            <DashboardSummary
              wallets={workspace.wallets.data}
              exchangeRates={workspace.exchangeRates.data}
              transactions={workspace.transactions.data}
            />
            <DashboardActions
              onDeposit={() => setModal('deposit')}
              onWithdraw={() => setModal('withdraw')}
              onStatement={handleStatement}
            />
            <DashboardTransactions transactions={workspace.transactions.data.slice(0, 6)} />
          </>
        )}

        {pageKey === 'transactions' && (
          <SectionCard title="Historico de Movimentacoes">
            <StatementTable
              transactions={workspace.transactions.data}
              onExportRow={exportRowPdf}
              onExportAll={exportAllPdf}
              userName={userName}
            />
          </SectionCard>
        )}

        {pageKey === 'wallets' && (
          <SectionCard title="Suas Contas em Real e Dolar">
            <WalletList wallets={workspace.wallets.data} />
          </SectionCard>
        )}

        {pageKey === 'cards' && (
          <SectionCard title="Seus Cartoes">
            <CardsGallery cards={workspace.cards.data} />
          </SectionCard>
        )}

        {pageKey === 'settings' && (
          <>
            <SectionCard title="Preferencias">
              <SimpleList items={workspace.settings.data} primaryKey="label" secondaryKey="value" />
            </SectionCard>
            <SectionCard title="Seguranca da Conta">
              <SimpleList items={workspace.securityEvents.data} />
            </SectionCard>
          </>
        )}
      </div>

      <MoneyModal
        mode={modal === 'withdraw' ? 'withdraw' : 'deposit'}
        open={modal === 'deposit' || modal === 'withdraw'}
        onClose={() => setModal(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
