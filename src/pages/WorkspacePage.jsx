import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency, useWorkspace } from '../context/WorkspaceContext.jsx'
import MoneyModal from '../components/MoneyModal.jsx'
import CreditCard from '../components/CreditCard.jsx'
import { useToast } from '../components/Toast.jsx'
import { ADMIN_EMAIL } from '../lib/mockEmailService.js'
import { openStatementPdf, openTransactionPdf } from '../lib/pdfExport.js'
import styles from './Dashboard.module.css'

const pageMeta = {
  home: {
    title: 'Dashboard',
    subtitle: 'Saldo, operações e histórico recente em um painel direto e elegante.',
  },
  transactions: {
    title: 'Extrato',
    subtitle: 'Consulte entradas, saídas e exporte cada movimentação em PDF.',
  },
  wallets: {
    title: 'Carteiras',
    subtitle: 'Veja seus saldos em real e dólar em um único painel.',
  },
  cards: {
    title: 'Cartões',
    subtitle: 'Gerencie cartões físicos e virtuais da conta.',
  },
  settings: {
    title: 'Configurações',
    subtitle: 'Defina preferências da conta e acompanhe os controles de segurança em um único lugar.',
  },
}

const txIcon = {
  receive: { color: 'var(--green)', bg: 'rgba(62,207,142,0.12)', symbol: '↓' },
  send: { color: 'var(--red)', bg: 'rgba(224,92,126,0.12)', symbol: '↑' },
  exchange: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', symbol: '⇌' },
}

function formatSourceMessage(status) {
  if (status === 'missing-config') {
    return 'Firebase ainda não foi configurado. Preencha as variáveis VITE_FIREBASE_* para usar dados reais.'
  }
  if (status === 'permission-denied') {
    return 'As regras atuais do Firestore bloqueiam leitura e escrita. A interface está usando dados de exemplo.'
  }
  if (status === 'error') {
    return 'Não foi possível carregar os dados do Firestore. A interface entrou no modo de demonstração.'
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
          {loading ? 'Sincronizando seu espaço financeiro.' : title}
        </div>
        <p className={styles.heroDescription}>{subtitle}</p>
        <div className={styles.heroMeta}>
          <div className={styles.heroBadge}>{userEmail || 'Modo de demonstração'}</div>
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
  const brlWallet = wallets.find((wallet) => wallet.symbol === 'BRL') ?? wallets[0]
  const usdWallet = wallets.find((wallet) => wallet.symbol === 'USD') ?? wallets[1] ?? wallets[0]
  const usdBrl = exchangeRates.find((rate) => rate.pair === 'USD/BRL') ?? exchangeRates[0]
  const positiveTransactions = transactions.filter((item) => item.amount?.startsWith('+')).length
  const stableLabel = positiveTransactions > 1 ? 'Fluxo positivo' : 'Movimento estável'

  return (
    <div className={styles.dashboardStats}>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentGreen} corner-box`}>
        <span className={styles.dashboardStatLabel}>Saldo em real</span>
        <div className={styles.dashboardStatValue}>{formatCurrency(brlWallet?.native || 0, 'BRL')}</div>
        <span className={styles.dashboardStatHint}>Conta BRL</span>
      </div>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentCyan} corner-box`}>
        <span className={styles.dashboardStatLabel}>Saldo em dólar</span>
        <div className={styles.dashboardStatValue}>{formatCurrency(usdWallet?.native || 0, 'USD')}</div>
        <span className={styles.dashboardStatHint}>Conta USD</span>
      </div>
      <div className={`${styles.dashboardStatCard} ${styles.statAccentBlue} corner-box`}>
        <span className={styles.dashboardStatLabel}>Cotação USD/BRL</span>
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
  const countLabel = `${transactions.length} ${transactions.length === 1 ? 'movimentação' : 'movimentações'}`

  return (
    <div className={styles.statementWrap}>
      <div className={styles.statementToolbar}>
        <div>
          <span className={styles.statementOwner}>Titular: <strong>{userName}</strong></span>
          <span className={styles.statementCount}>{countLabel}</span>
        </div>
        <button type="button" className={styles.viewAllBtn} onClick={onExportAll}>
          Exportar extrato completo em PDF
        </button>
      </div>
      <div className={`${styles.txTable} corner-box`}>
        <div className={styles.statementHead}>
          <span>Transação</span>
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
                  {tx.status === 'pending' ? 'Aguardando' : tx.status === 'rejected' ? 'Recusado' : 'Concluído'}
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
    const kindMap = { receive: 'Depósito', send: 'Saque', exchange: 'Câmbio' }
    const noteMap = { receive: 'Entrada na conta', send: 'Saída da conta', exchange: 'Conversão BRL/USD' }

    return {
      id: tx.id,
      date: tx.time.includes(',') ? `0${index + 1}/04/2026` : tx.time,
      type: kindMap[tx.type] ?? 'Movimento',
      value: amount,
      status: tx.status === 'pending' ? 'Em análise' : tx.status === 'rejected' ? 'Recusado' : 'Confirmado',
      note: tx.from || noteMap[tx.type] || 'Sem observação',
      positive: amount.startsWith('+'),
    }
  })

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>Transações recentes</h3>
      <div className={`${styles.dashboardTable} corner-box`}>
        <div className={styles.dashboardTableHead}>
          <span>Data</span>
          <span>Tipo</span>
          <span>Valor</span>
          <span>Status</span>
          <span>Observação</span>
        </div>
        <div className={styles.dashboardTableBody}>
          {rows.length === 0 ? (
            <div className={styles.dashboardTableRow}>
              <span style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(232,225,219,0.55)' }}>
                Nenhuma movimentação ainda. Faça um depósito para começar.
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

function CardsGallery({ cards, onDeleteCard }) {
  if (!cards.length) {
    return <p className={styles.heroDescription}>Nenhum cartão cadastrado ainda.</p>
  }

  return (
    <div className={styles.cardsGallery}>
      {cards.map((card) => (
        <div key={card.id} className={styles.cardShowcase}>
          <div className={styles.cardActions}>
            <button type="button" className={styles.cardDeleteButton} onClick={() => onDeleteCard(card)}>
              Excluir cartão
            </button>
          </div>
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

function detectCardBrand(number = '') {
  const digits = String(number).replace(/\D/g, '')
  if (digits.startsWith('4')) return 'Visa Signature'
  if (/^5[1-5]/.test(digits)) return 'Mastercard Black'
  if (/^2(2[2-9]|[3-6]|7[01])/.test(digits)) return 'Mastercard Platinum'
  if (/^3[47]/.test(digits)) return 'American Express'
  return 'Cartão digital'
}

function formatCardNumber(value = '') {
  return String(value)
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
    .trim()
}

function formatCardExpiry(value = '') {
  const digits = String(value).replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

function AddCardPanel({ defaultHolder, onAddCard }) {
  const [form, setForm] = useState({
    holder: defaultHolder || '',
    number: '',
    valid: '',
    cvv: '',
    currency: 'BRL',
    limit: '',
  })
  const [feedback, setFeedback] = useState('')

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setFeedback('')
  }

  function handleSubmit(event) {
    event.preventDefault()

    const holder = String(form.holder || '').trim().toUpperCase()
    const number = formatCardNumber(form.number)
    const digits = number.replace(/\D/g, '')
    const valid = formatCardExpiry(form.valid)
    const cvv = String(form.cvv || '').replace(/\D/g, '').slice(0, 4)
    const limitValue = String(form.limit || '').trim()

    if (!holder || digits.length < 16 || valid.length !== 5 || cvv.length < 3 || !limitValue) {
      setFeedback('Preencha nome, número, validade, CVV e limite para adicionar o cartão.')
      return
    }

    onAddCard({
      id: `local-card-${Date.now()}`,
      brand: detectCardBrand(digits),
      holder,
      number,
      valid,
      cvv: '*'.repeat(cvv.length),
      currency: form.currency,
      limit: form.currency === 'BRL' ? `R$ ${limitValue}` : `$ ${limitValue}`,
      status: 'Ativo',
    })

    setForm((current) => ({
      ...current,
      holder,
      number: '',
      valid: '',
      cvv: '',
      limit: '',
    }))
    setFeedback('Cartão adicionado com sucesso. Ele já aparece na galeria abaixo.')
  }

  return (
    <div className={styles.cardComposerGrid}>
      <form className={`${styles.cardComposer} corner-box`} onSubmit={handleSubmit}>
        <div className={styles.cardComposerHeader}>
          <span className={styles.cardComposerKicker}>Dados do cartão</span>
          <h4 className={styles.cardComposerTitle}>Adicionar novo cartão</h4>
          <p className={styles.cardComposerText}>
            Cadastre um cartão manualmente para que ele apareça na galeria com o visual já estilizado.
          </p>
        </div>

        <label className={styles.cardField}>
          <span>Nome impresso</span>
          <input
            type="text"
            value={form.holder}
            onChange={(event) => updateField('holder', event.target.value.toUpperCase())}
            placeholder="NOME SOBRENOME"
            maxLength={26}
          />
        </label>

        <label className={styles.cardField}>
          <span>Número do cartão</span>
          <input
            type="text"
            inputMode="numeric"
            value={form.number}
            onChange={(event) => updateField('number', formatCardNumber(event.target.value))}
            placeholder="0000 0000 0000 0000"
            maxLength={19}
          />
        </label>

        <div className={styles.cardFieldRow}>
          <label className={styles.cardField}>
            <span>Validade</span>
            <input
              type="text"
              inputMode="numeric"
              value={form.valid}
              onChange={(event) => updateField('valid', formatCardExpiry(event.target.value))}
              placeholder="MM/AA"
              maxLength={5}
            />
          </label>

          <label className={styles.cardField}>
            <span>CVV</span>
            <input
              type="text"
              inputMode="numeric"
              value={form.cvv}
              onChange={(event) => updateField('cvv', String(event.target.value).replace(/\D/g, '').slice(0, 4))}
              placeholder="123"
              maxLength={4}
            />
          </label>
        </div>

        <div className={styles.cardFieldRow}>
          <label className={styles.cardField}>
            <span>Moeda</span>
            <select value={form.currency} onChange={(event) => updateField('currency', event.target.value)}>
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <label className={styles.cardField}>
            <span>Limite</span>
            <input
              type="text"
              inputMode="decimal"
              value={form.limit}
              onChange={(event) => updateField('limit', event.target.value.replace(/[^\d.,]/g, '').slice(0, 12))}
              placeholder={form.currency === 'BRL' ? '12.000,00' : '4,500.00'}
            />
          </label>
        </div>

        {feedback ? <p className={styles.cardComposerMessage}>{feedback}</p> : null}

        <button type="submit" className={styles.cardComposerButton}>
          Adicionar cartão
        </button>
      </form>

      <aside className={`${styles.cardInstructions} corner-box`}>
        <div className={styles.cardInstructionsHeader}>
          <span className={styles.cardInstructionsIcon}>◫</span>
          <strong>Como funciona</strong>
        </div>
        <ol className={styles.cardInstructionsList}>
          <li>Preencha os dados principais do cartão.</li>
          <li>Defina a moeda e o limite da conta vinculada.</li>
          <li>Clique em adicionar para gerar o cartão visual.</li>
          <li>Use o botão de exclusão para remover cartões com confirmação.</li>
        </ol>
        <div className={styles.cardInstructionsNote}>
          Esse fluxo simula a experiência de cadastro antes da integração com backend ou carteira digital.
        </div>
      </aside>
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

// ── Notificações do usuário (respostas do admin) ─────────────────────────────

function UserNotifications({ notifications, onDismiss }) {
  if (!notifications || notifications.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>Notificações do administrador</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.map((n) => {
          const isApproval = n.type === 'approval'
          return (
            <div
              key={n.id}
              className={`corner-box`}
              style={{
                background: isApproval ? 'rgba(62,207,142,0.07)' : 'rgba(224,92,126,0.07)',
                border: `1px solid ${isApproval ? 'rgba(62,207,142,0.25)' : 'rgba(224,92,126,0.22)'}`,
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: isApproval ? 'var(--green)' : 'var(--red)',
                }}>
                  {n.subject}
                </span>
                <span
                  style={{ fontSize: '0.78rem', color: 'rgba(232,225,219,0.62)', lineHeight: 1.5 }}
                  dangerouslySetInnerHTML={{ __html: n.body }}
                />
                <span style={{ fontSize: '0.68rem', color: 'rgba(232,225,219,0.38)', marginTop: '2px' }}>
                  De: {n.from} · {n.sentAt}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onDismiss(n.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(232,225,219,0.4)',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default function WorkspacePage({ pageKey }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const workspace = useWorkspace()
  const toast = useToast()
  const [modal, setModal] = useState(null)
  const [localCards, setLocalCards] = useState([])
  const [deletedCardIds, setDeletedCardIds] = useState([])

  const meta = pageMeta[pageKey] ?? pageMeta.home
  const bannerMessage = useMemo(
    () => formatSourceMessage(workspace.transactions.status) ?? formatSourceMessage(workspace.wallets.status),
    [workspace.transactions.status, workspace.wallets.status],
  )

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const userName = user?.displayName || user?.email || 'Cliente Ocean Capital'
  const dateLabel = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleConfirm(payload) {
    if (modal === 'deposit') {
      workspace.submitRequest({ type: 'deposit', ...payload })
      toast.push({
        type: 'info',
        title: 'Solicitação enviada ao administrador',
        message: `Um email foi enviado para ${ADMIN_EMAIL}. Aguarde a aprovação.`,
        duration: 6000,
      })
    } else if (modal === 'withdraw') {
      workspace.submitRequest({ type: 'withdraw', ...payload })
      toast.push({
        type: 'info',
        title: 'Solicitação enviada ao administrador',
        message: `Um email foi enviado para ${ADMIN_EMAIL}. Aguarde a aprovação.`,
        duration: 6000,
      })
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

  function handleAddCard(card) {
    setLocalCards((current) => [card, ...current])
  }

  function handleDeleteCard(card) {
    const approved = window.confirm(`Deseja realmente excluir o cartão ${card.brand}?`)
    if (!approved) return

    setLocalCards((current) => current.filter((item) => item.id !== card.id))
    setDeletedCardIds((current) => (current.includes(card.id) ? current : [...current, card.id]))
  }

  const cardsData = [...localCards, ...workspace.cards.data].filter((card) => !deletedCardIds.includes(card.id))

  return (
    <div className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>{meta.title}</h2>
          <span className={styles.pageDate}>{dateLabel}</span>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.topAvatar}>{(user?.displayName || user?.email || 'OC').slice(0, 2).toUpperCase()}</div>
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
            <UserNotifications
              notifications={workspace.userNotifications}
              onDismiss={workspace.dismissNotification}
            />
            <DashboardTransactions transactions={workspace.transactions.data.slice(0, 6)} />
          </>
        )}

        {pageKey === 'transactions' && (
          <SectionCard title="Histórico de movimentações">
            <StatementTable
              transactions={workspace.transactions.data}
              onExportRow={exportRowPdf}
              onExportAll={exportAllPdf}
              userName={userName}
            />
          </SectionCard>
        )}

        {pageKey === 'wallets' && (
          <SectionCard title="Suas contas em real e dólar">
            <WalletList wallets={workspace.wallets.data} />
          </SectionCard>
        )}

        {pageKey === 'cards' && (
          <>
            <SectionCard title="Adicionar cartão">
              <AddCardPanel defaultHolder={userName} onAddCard={handleAddCard} />
            </SectionCard>
            <SectionCard title="Seus cartões">
              <CardsGallery cards={cardsData} onDeleteCard={handleDeleteCard} />
            </SectionCard>
          </>
        )}

        {pageKey === 'settings' && (
          <>
            <SectionCard title="Preferências">
              <SimpleList items={workspace.settings.data} primaryKey="label" secondaryKey="value" />
            </SectionCard>
            <SectionCard title="Segurança da conta">
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
