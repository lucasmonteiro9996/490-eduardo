import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCurrency, useWorkspace } from '../context/WorkspaceContext.jsx'
import { usePreferences } from '../context/PreferencesContext.jsx'
import MoneyModal from '../components/MoneyModal.jsx'
import CreditCard from '../components/CreditCard.jsx'
import { useToast } from '../components/Toast.jsx'
import { ADMIN_NOTIFICATION_EMAIL } from '../lib/emailService.js'
import { openStatementPdf, openTransactionPdf } from '../lib/pdfExport.js'
import styles from './Dashboard.module.css'

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
  const { t } = usePreferences()
  if (!message) return null
  return (
    <section className={`${styles.infoBanner} corner-box`}>
      <div className={styles.heroLeft}>
        <span className={styles.heroLabel}>{t('firebase_status')}</span>
        <div className={styles.infoBannerText}>
          {message}
        </div>
      </div>
    </section>
  )
}

function TransactionsSummary({ transactions }) {
  const { t } = usePreferences()
  const received = transactions.filter((tx) => tx.type === 'receive').length
  const sent = transactions.filter((tx) => tx.type === 'send').length
  const exchanged = transactions.filter((tx) => tx.type === 'exchange').length
  const pending = transactions.filter((tx) => tx.status === 'pending').length

  return (
    <div className={styles.pageSummary}>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: 'var(--green)' }}>{received}</span>
        <span className={styles.pageSummaryLabel}>{t('entries')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: 'var(--red)' }}>{sent}</span>
        <span className={styles.pageSummaryLabel}>{t('exits')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: '#a78bfa' }}>{exchanged}</span>
        <span className={styles.pageSummaryLabel}>{t('exchanges')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: pending > 0 ? '#f5c842' : 'rgba(232,225,219,0.4)' }}>{pending}</span>
        <span className={styles.pageSummaryLabel}>{t('pending')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue}>{transactions.length}</span>
        <span className={styles.pageSummaryLabel}>{t('total')}</span>
      </div>
    </div>
  )
}

function WalletsSummary({ wallets, exchangeRates }) {
  const { t, preferredCurrency } = usePreferences()
  const brlWallet = wallets.find((w) => w.symbol === 'BRL')
  const usdWallet = wallets.find((w) => w.symbol === 'USD')
  const usdBrl = exchangeRates.find((r) => r.pair === 'USD/BRL')

  const rateNum = parseFloat(
    String(usdBrl?.value || '').replace('R$', '').replace(/\./g, '').replace(',', '.').trim()
  ) || 5.08

  const totalBrl = (brlWallet?.native || 0) + (usdWallet?.native || 0) * rateNum

  const brlStat = (
    <div className={styles.pageSummaryStat}>
      <span className={styles.pageSummaryValue} style={{ color: '#3ecf8e' }}>{formatCurrency(brlWallet?.native || 0, 'BRL')}</span>
      <span className={styles.pageSummaryLabel}>{t('balance_brl')}</span>
      <span className={styles.pageSummaryHint}>{brlWallet?.change || '+0,0%'}</span>
    </div>
  )

  const usdStat = (
    <div className={styles.pageSummaryStat}>
      <span className={styles.pageSummaryValue} style={{ color: '#4a7fdb' }}>{formatCurrency(usdWallet?.native || 0, 'USD')}</span>
      <span className={styles.pageSummaryLabel}>{t('balance_usd')}</span>
      <span className={styles.pageSummaryHint}>{usdWallet?.change || '+0,0%'}</span>
    </div>
  )

  return (
    <div className={styles.pageSummary}>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue}>{formatCurrency(totalBrl, 'BRL')}</span>
        <span className={styles.pageSummaryLabel}>{t('portfolio_total')}</span>
        <span className={styles.pageSummaryHint}>{t('portfolio_hint')}</span>
      </div>
      {preferredCurrency === 'USD' ? usdStat : brlStat}
      {preferredCurrency === 'USD' ? brlStat : usdStat}
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue}>{usdBrl?.value || 'R$ 5,08'}</span>
        <span className={styles.pageSummaryLabel}>{t('rate')}</span>
        <span className={styles.pageSummaryHint}>{usdBrl?.change || '+0,0%'}</span>
      </div>
    </div>
  )
}

function CardsSummary({ cards }) {
  const { t } = usePreferences()
  const activeCount = cards.filter((c) => c.status === 'Ativo').length
  const brlCards = cards.filter((c) => c.currency === 'BRL').length
  const usdCards = cards.filter((c) => c.currency === 'USD').length

  return (
    <div className={styles.pageSummary}>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue}>{cards.length}</span>
        <span className={styles.pageSummaryLabel}>{cards.length === 1 ? t('cards_registered_1') : t('cards_registered_n')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: 'var(--green)' }}>{activeCount}</span>
        <span className={styles.pageSummaryLabel}>{activeCount === 1 ? t('active_1') : t('active_n')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue}>{brlCards}</span>
        <span className={styles.pageSummaryLabel}>{t('brl_cards')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue}>{usdCards}</span>
        <span className={styles.pageSummaryLabel}>{t('usd_cards')}</span>
      </div>
    </div>
  )
}

function SettingsSummary({ userName, userEmail, securityEvents }) {
  const { t } = usePreferences()
  const twoFactor = securityEvents.some((e) => String(e.title || '').toLowerCase().includes('duas etapas'))

  return (
    <div className={styles.pageSummary}>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ fontSize: '1rem' }}>{userName}</span>
        <span className={styles.pageSummaryLabel}>{t('account_holder')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ fontSize: '0.88rem', fontWeight: 600 }}>{userEmail || '—'}</span>
        <span className={styles.pageSummaryLabel}>{t('email_access')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: 'var(--green)', fontSize: '0.88rem' }}>{t('account_active')}</span>
        <span className={styles.pageSummaryLabel}>{t('account_status')}</span>
      </div>
      <div className={styles.pageSummaryStat}>
        <span className={styles.pageSummaryValue} style={{ color: twoFactor ? 'var(--green)' : '#f5c842', fontSize: '0.88rem' }}>
          {twoFactor ? t('two_factor_on') : t('two_factor_off')}
        </span>
        <span className={styles.pageSummaryLabel}>{t('two_factor')}</span>
      </div>
    </div>
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

function UserRequestStatus({ requests }) {
  const { t } = usePreferences()
  if (!requests?.length) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t('requests_title')}</h3>
      </div>
      <div className={styles.walletList}>
        {requests.map((request) => {
          const statusLabel = request.status === 'pending'
            ? t('pending_admin')
            : request.status === 'approved'
              ? t('approved_admin')
              : t('refused_admin')

          return (
            <div key={request.requestId || request.id} className={`${styles.walletItem} corner-box`}>
              <div className={styles.walletInfo}>
                <span className={styles.walletAmount}>
                  {request.type === 'deposit' ? t('tx_deposit_label') : t('tx_withdraw_label')} · {request.formattedAmount}
                </span>
                <span className={styles.walletName}>
                  {request.type === 'deposit'
                    ? `${t('origin')}: ${request.source || 'TED'}`
                    : `${t('destination')}: ${request.destination || 'TED'}`}
                </span>
              </div>
              <div className={styles.walletRight}>
                <span className={styles.walletUsd}>{request.createdAtLabel || request.createdAt}</span>
                <span className={`${styles.walletChange} ${
                  request.status === 'approved' ? styles.up : request.status === 'rejected' ? styles.down : ''
                }`}>
                  {statusLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function DashboardSummary({ wallets, exchangeRates, transactions }) {
  const { t, preferredCurrency } = usePreferences()
  const brlWallet = wallets.find((wallet) => wallet.symbol === 'BRL') ?? wallets[0]
  const usdWallet = wallets.find((wallet) => wallet.symbol === 'USD') ?? wallets[1] ?? wallets[0]
  const usdBrl = exchangeRates.find((rate) => rate.pair === 'USD/BRL') ?? exchangeRates[0]
  const positiveTransactions = transactions.filter((item) => item.amount?.startsWith('+')).length
  const stableLabel = positiveTransactions > 1 ? t('flow_positive') : t('flow_stable')

  const brlCard = (
    <div className={`${styles.dashboardStatCard} ${styles.statAccentGreen} corner-box ${preferredCurrency === 'BRL' ? styles.statPrimary : ''}`}>
      <span className={styles.dashboardStatLabel}>{t('balance_brl')}</span>
      <div className={styles.dashboardStatValue}>{formatCurrency(brlWallet?.native || 0, 'BRL')}</div>
      <span className={styles.dashboardStatHint}>{t('account_brl')}</span>
    </div>
  )

  const usdCard = (
    <div className={`${styles.dashboardStatCard} ${styles.statAccentCyan} corner-box ${preferredCurrency === 'USD' ? styles.statPrimary : ''}`}>
      <span className={styles.dashboardStatLabel}>{t('balance_usd')}</span>
      <div className={styles.dashboardStatValue}>{formatCurrency(usdWallet?.native || 0, 'USD')}</div>
      <span className={styles.dashboardStatHint}>{t('account_usd')}</span>
    </div>
  )

  return (
    <div className={styles.dashboardStats}>
      {preferredCurrency === 'USD' ? usdCard : brlCard}
      {preferredCurrency === 'USD' ? brlCard : usdCard}
      <div className={`${styles.dashboardStatCard} ${styles.statAccentBlue} corner-box`}>
        <span className={styles.dashboardStatLabel}>{t('rate_label')}</span>
        <div className={styles.dashboardStatValue}>{usdBrl?.value || 'R$ 5,08'}</div>
        <span className={styles.dashboardStatHint}>{usdBrl?.change || '+0,32%'} {stableLabel}</span>
      </div>
    </div>
  )
}

function DashboardActions({ onDeposit, onWithdraw, onStatement }) {
  const { t } = usePreferences()
  return (
    <div className={styles.dashboardActions}>
      <button className={`${styles.dashboardActionBtn} ${styles.actionGreen} corner-box`} type="button" onClick={onDeposit}>
        {t('deposit')}
      </button>
      <button className={`${styles.dashboardActionBtn} ${styles.actionOrange} corner-box`} type="button" onClick={onWithdraw}>
        {t('withdraw')}
      </button>
      <button className={`${styles.dashboardActionBtn} ${styles.actionBlue} corner-box`} type="button" onClick={onStatement}>
        {t('statement')}
      </button>
    </div>
  )
}

function WalletList({ wallets }) {
  const { preferredCurrency } = usePreferences()
  const sorted = [...wallets].sort((a, b) => {
    if (a.symbol === preferredCurrency) return -1
    if (b.symbol === preferredCurrency) return 1
    return 0
  })

  return (
    <div className={styles.walletList}>
      {sorted.map((wallet) => (
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
  const { t } = usePreferences()
  const countLabel = `${transactions.length} ${transactions.length === 1 ? t('count_1') : t('count_n')}`

  return (
    <div className={styles.statementWrap}>
      <div className={styles.statementToolbar}>
        <div>
          <span className={styles.statementOwner}>{t('holder_label')}: <strong>{userName}</strong></span>
          <span className={styles.statementCount}>{countLabel}</span>
        </div>
        <button type="button" className={styles.viewAllBtn} onClick={onExportAll}>
          {t('export_pdf_btn')}
        </button>
      </div>
      <div className={`${styles.txTable} corner-box`}>
        <div className={styles.statementHead}>
          <span>{t('col_transaction')}</span>
          <span>{t('col_date')}</span>
          <span>{t('col_status')}</span>
          <span style={{ textAlign: 'right' }}>{t('col_amount')}</span>
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
                  {tx.status === 'pending' ? t('status_pending') : tx.status === 'rejected' ? t('status_rejected') : t('status_completed')}
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
  const { t } = usePreferences()

  const rows = transactions.map((tx) => {
    const amount = tx.amount || ''
    const kindMap = { receive: t('tx_deposit'), send: t('tx_withdraw'), exchange: t('tx_exchange') }
    const noteMap = { receive: t('note_incoming'), send: t('note_outgoing'), exchange: t('note_exchange') }

    return {
      id: tx.id,
      date: tx.time.includes(',') ? tx.time.split(',')[0] : tx.time,
      type: kindMap[tx.type] ?? t('tx_deposit'),
      value: amount,
      status: tx.status === 'pending' ? t('status_pending') : tx.status === 'rejected' ? t('status_rejected') : t('status_confirmed'),
      note: tx.from || noteMap[tx.type] || t('col_note'),
      positive: amount.startsWith('+'),
    }
  })

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>{t('recent_tx')}</h3>
      <div className={`${styles.dashboardTable} corner-box`}>
        <div className={styles.dashboardTableHead}>
          <span>{t('col_date')}</span>
          <span>{t('col_type')}</span>
          <span>{t('col_amount')}</span>
          <span>{t('col_status')}</span>
          <span>{t('col_note')}</span>
        </div>
        <div className={styles.dashboardTableBody}>
          {rows.length === 0 ? (
            <div className={styles.dashboardTableRow}>
              <span style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(232,225,219,0.55)' }}>
                {t('no_movements')}
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
  const { t } = usePreferences()
  const [pendingDelete, setPendingDelete] = useState(null)

  if (!cards.length) {
    return <p className={styles.heroDescription}>{t('no_cards')}</p>
  }

  return (
    <div className={styles.cardsGallery}>
      {cards.map((card) => (
        <div key={card.id} className={styles.cardShowcase}>
          <div className={styles.cardActions}>
            {pendingDelete === card.id ? (
              <div className={styles.cardDeleteConfirm}>
                <span className={styles.cardDeleteQuestion}>{card.brand}?</span>
                <button
                  type="button"
                  className={styles.cardConfirmBtn}
                  onClick={() => { onDeleteCard(card); setPendingDelete(null) }}
                >
                  {t('delete_confirm')}
                </button>
                <button
                  type="button"
                  className={styles.cardCancelBtn}
                  onClick={() => setPendingDelete(null)}
                >
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <button type="button" className={styles.cardDeleteButton} onClick={() => setPendingDelete(card.id)}>
                {t('delete_card')}
              </button>
            )}
          </div>
          <CreditCard brand={card.brand} holder={card.holder} number={card.number} valid={card.valid} cvv={card.cvv} />
          <div className={styles.cardMeta}>
            <div>
              <span className={styles.cardMetaLabel}>{t('meta_currency')}</span>
              <span className={styles.cardMetaValue}>{card.currency}</span>
            </div>
            <div>
              <span className={styles.cardMetaLabel}>{t('meta_limit')}</span>
              <span className={styles.cardMetaValue}>{card.limit}</span>
            </div>
            <div>
              <span className={styles.cardMetaLabel}>{t('meta_status')}</span>
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
  const { t } = usePreferences()
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
      setFeedback(t('card_error_fill'))
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
    setFeedback(t('card_added_ok'))
  }

  return (
    <div className={styles.cardComposerGrid}>
      <form className={`${styles.cardComposer} corner-box`} onSubmit={handleSubmit}>
        <div className={styles.cardComposerHeader}>
          <span className={styles.cardComposerKicker}>{t('card_data_kicker')}</span>
          <h4 className={styles.cardComposerTitle}>{t('add_card_title')}</h4>
          <p className={styles.cardComposerText}>
            {t('add_card_desc')}
          </p>
        </div>

        <label className={styles.cardField}>
          <span>{t('field_holder')}</span>
          <input
            type="text"
            value={form.holder}
            onChange={(event) => updateField('holder', event.target.value.toUpperCase())}
            placeholder="NOME SOBRENOME"
            maxLength={26}
          />
        </label>

        <label className={styles.cardField}>
          <span>{t('field_number')}</span>
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
            <span>{t('field_expiry')}</span>
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
            <span>{t('field_cvv')}</span>
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
            <span>{t('field_currency')}</span>
            <select value={form.currency} onChange={(event) => updateField('currency', event.target.value)}>
              <option value="BRL">BRL</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <label className={styles.cardField}>
            <span>{t('field_limit')}</span>
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
          {t('add_card_btn')}
        </button>
      </form>

      <aside className={`${styles.cardInstructions} corner-box`}>
        <div className={styles.cardInstructionsHeader}>
          <span className={styles.cardInstructionsIcon}>◫</span>
          <strong>{t('how_title')}</strong>
        </div>
        <ol className={styles.cardInstructionsList}>
          <li>{t('how_step1')}</li>
          <li>{t('how_step2')}</li>
          <li>{t('how_step3')}</li>
          <li>{t('how_step4')}</li>
        </ol>
        <div className={styles.cardInstructionsNote}>
          {t('how_note')}
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

function PreferencesPanel() {
  const { t, language, preferredCurrency, changeLanguage, changeCurrency } = usePreferences()

  const languages = [
    { code: 'pt', label: 'Português' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
  ]

  const currencies = [
    { code: 'BRL', label: t('currency_brl') },
    { code: 'USD', label: t('currency_usd') },
  ]

  return (
    <div className={styles.prefGrid}>
      <div className={styles.prefGroup}>
        <span className={styles.prefGroupLabel}>{t('pref_primary_currency')}</span>
        <div className={styles.prefOptions}>
          {currencies.map((c) => (
            <button
              key={c.code}
              type="button"
              className={`${styles.prefOption} ${preferredCurrency === c.code ? styles.prefOptionActive : ''}`}
              onClick={() => changeCurrency(c.code)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.prefGroup}>
        <span className={styles.prefGroupLabel}>{t('pref_language')}</span>
        <div className={styles.prefOptions}>
          {languages.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`${styles.prefOption} ${language === l.code ? styles.prefOptionActive : ''}`}
              onClick={() => changeLanguage(l.code)}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Notificações do usuário (respostas do admin) ─────────────────────────────

function UserNotifications({ notifications, onDismiss }) {
  const { t } = usePreferences()
  if (!notifications || notifications.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h3 className={styles.sectionTitle}>{t('notifications_title')}</h3>
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
                <span style={{ fontSize: '0.78rem', color: 'rgba(232,225,219,0.62)', lineHeight: 1.5 }}>
                  {n.body}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(232,225,219,0.38)', marginTop: '2px' }}>
                  {t('from_label')}: {n.from} · {n.sentAt}
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
                aria-label={t('close_label')}
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

const LOCALE_MAP = { pt: 'pt-BR', en: 'en-US', es: 'es-ES' }

export default function WorkspacePage({ pageKey }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const workspace = useWorkspace()
  const toast = useToast()
  const { t, language } = usePreferences()
  const [modal, setModal] = useState(null)
  const [localCards, setLocalCards] = useState([])
  const [deletedCardIds, setDeletedCardIds] = useState([])

  const pageTitleKey = {
    home: 'page_home',
    transactions: 'page_transactions',
    wallets: 'page_wallets',
    cards: 'page_cards',
    settings: 'page_settings',
  }

  const bannerMessage = useMemo(
    () => formatSourceMessage(workspace.transactions.status) ?? formatSourceMessage(workspace.wallets.status),
    [workspace.transactions.status, workspace.wallets.status],
  )

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const userName = user?.displayName || user?.email || 'Cliente Ocean Capital'
  const dateLabel = new Date().toLocaleDateString(LOCALE_MAP[language] || 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  function handleConfirm(payload) {
    if (modal === 'deposit') {
      workspace.submitRequest({ type: 'deposit', ...payload })
      toast.push({
        type: 'info',
        title: 'Solicitação enviada ao administrador',
        message: `O pedido entrou na inbox do admin e a tentativa de email foi direcionada para ${ADMIN_NOTIFICATION_EMAIL}.`,
        duration: 6000,
      })
    } else if (modal === 'withdraw') {
      workspace.submitRequest({ type: 'withdraw', ...payload })
      toast.push({
        type: 'info',
        title: 'Solicitação enviada ao administrador',
        message: `O pedido entrou na inbox do admin e a tentativa de email foi direcionada para ${ADMIN_NOTIFICATION_EMAIL}.`,
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
    setLocalCards((current) => current.filter((item) => item.id !== card.id))
    setDeletedCardIds((current) => (current.includes(card.id) ? current : [...current, card.id]))
  }

  const cardsData = [...localCards, ...workspace.cards.data].filter((card) => !deletedCardIds.includes(card.id))

  return (
    <div className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h2 className={styles.pageTitle}>{t(pageTitleKey[pageKey] ?? 'page_home')}</h2>
          <span className={styles.pageDate}>{dateLabel}</span>
        </div>
        <div className={styles.topbarRight}>
          <div className={styles.topAvatar}>{(user?.displayName || user?.email || 'OC').slice(0, 2).toUpperCase()}</div>
          <button className={styles.viewAllBtn} onClick={handleLogout} type="button">
            {t('logout')}
          </button>
        </div>
      </header>

      <div className={styles.content}>
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
            <UserRequestStatus requests={workspace.userRequests} />
            <UserNotifications
              notifications={workspace.userNotifications}
              onDismiss={workspace.dismissNotification}
            />
            <DashboardTransactions transactions={workspace.transactions.data.slice(0, 6)} />
          </>
        )}

        {pageKey === 'transactions' && (
          <>
            <TransactionsSummary transactions={workspace.transactions.data} />
            <SectionCard title={t('section_history')}>
              <StatementTable
                transactions={workspace.transactions.data}
                onExportRow={exportRowPdf}
                onExportAll={exportAllPdf}
                userName={userName}
              />
            </SectionCard>
          </>
        )}

        {pageKey === 'wallets' && (
          <>
            <WalletsSummary
              wallets={workspace.wallets.data}
              exchangeRates={workspace.exchangeRates.data}
            />
            <SectionCard title={t('section_wallets')}>
              <WalletList wallets={workspace.wallets.data} />
            </SectionCard>
          </>
        )}

        {pageKey === 'cards' && (
          <>
            <CardsSummary cards={cardsData} />
            <SectionCard title={t('section_add_card')}>
              <AddCardPanel defaultHolder={userName} onAddCard={handleAddCard} />
            </SectionCard>
            <SectionCard title={t('section_cards')}>
              <CardsGallery cards={cardsData} onDeleteCard={handleDeleteCard} />
            </SectionCard>
          </>
        )}

        {pageKey === 'settings' && (
          <>
            <SettingsSummary
              userName={userName}
              userEmail={user?.email}
              securityEvents={workspace.securityEvents.data}
            />
            <SectionCard title={t('section_preferences')}>
              <PreferencesPanel />
            </SectionCard>
            <SectionCard title={t('section_security')}>
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
