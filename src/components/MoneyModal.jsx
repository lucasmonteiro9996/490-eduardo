import { useEffect, useMemo, useRef, useState } from 'react'
import { usePreferences } from '../context/PreferencesContext.jsx'
import styles from './MoneyModal.module.css'

const depositSources = {
  BRL: ['PIX', 'Cartao', 'TED', 'Boleto bancario'],
  USD: ['Transferencia internacional (SWIFT)', 'Wire transfer', 'ACH', 'Deposito em conta corrente'],
}

const withdrawDestinations = {
  BRL: ['Cartao', 'TED', 'Boleto bancario'],
  USD: ['Transferencia internacional (SWIFT)', 'Wire transfer', 'ACH', 'Saque em caixa 24h'],
}

const investProducts = {
  BRL: ['CDB', 'Tesouro Direto', 'Fundos multimercado', 'Renda fixa'],
  USD: ['Treasury bonds', 'Equity funds', 'Fixed income', 'Global portfolio'],
}

const methodDescriptions = {
  PIX: 'Deposito via PIX. Envie o comprovante na observacao, se quiser.',
  Cartao: 'Pagamento com cartao salvo e validacao do admin.',
  TED: 'Transferencia bancaria com dados do titular.',
  'Boleto bancario': 'Emissao e compensacao com aprovacao administrativa.',
  'Transferencia internacional (SWIFT)': 'Operacao internacional por rede SWIFT.',
  'Wire transfer': 'Transferencia internacional por instituicao bancaria.',
  ACH: 'Transferencia eletronica padrao para conta nos EUA.',
  'Deposito em conta corrente': 'Credito manual em conta corrente vinculada.',
  'Saque em caixa 24h': 'Retirada processada conforme aprovacao operacional.',
}

function buildEmptyBankAccount() {
  return {
    ownerName: '',
    cpfCnpj: '',
    bankCode: '',
    agency: '',
    account: '',
    accountDigit: '',
    bankAccountType: 'CHECKING_ACCOUNT',
  }
}

export default function MoneyModal({ mode, open, onClose, onConfirm, initialBankAccount = null, savedCards = [] }) {
  const { t } = usePreferences()
  const [symbol, setSymbol] = useState('BRL')
  const [amount, setAmount] = useState('')
  const [extra, setExtra] = useState(
    mode === 'invest' ? investProducts.BRL[0] : mode === 'deposit' ? depositSources.BRL[0] : withdrawDestinations.BRL[0],
  )
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [bankAccount, setBankAccount] = useState(buildEmptyBankAccount())
  const [selectedCardId, setSelectedCardId] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!open) return

    setAmount('')
    setNote('')
    setError('')
    setSubmitting(false)
    setSymbol('BRL')
    setExtra(
      mode === 'invest' ? investProducts.BRL[0] : mode === 'deposit' ? depositSources.BRL[0] : withdrawDestinations.BRL[0],
    )
    setBankAccount(initialBankAccount ? { ...buildEmptyBankAccount(), ...initialBankAccount } : buildEmptyBankAccount())
    setSelectedCardId(savedCards[0]?.id || '')

    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [initialBankAccount, open, mode, savedCards])

  useEffect(() => {
    const options = mode === 'invest'
      ? investProducts[symbol]
      : mode === 'deposit'
        ? depositSources[symbol]
        : withdrawDestinations[symbol]
    setExtra(options[0])
  }, [symbol, mode])

  const isDeposit = mode === 'deposit'
  const isInvest = mode === 'invest'
  const title = isInvest ? t('invest') : isDeposit ? t('deposit') : t('withdraw')
  const extraOptions = isInvest
    ? investProducts[symbol]
    : isDeposit
      ? depositSources[symbol]
      : withdrawDestinations[symbol]
  const actionLabel = isInvest ? t('modal_invest_action') : isDeposit ? t('modal_deposit_action') : t('modal_withdraw_action')
  const extraLabel = isInvest ? t('modal_invest_product') : isDeposit ? t('modal_origin') : t('modal_dest')
  const currencySymbol = symbol === 'BRL' ? 'R$' : '$'
  const normalizedExtra = String(extra || '').toLowerCase()
  const needsTedBankFields = !isDeposit && symbol === 'BRL' && extra === 'TED'
  const needsSavedCard = isDeposit && symbol === 'BRL' && normalizedExtra.includes('cart')
  const providerHint = isDeposit && symbol === 'BRL' && (normalizedExtra.includes('cart') || normalizedExtra.includes('boleto'))
    ? 'Ao continuar, uma cobranca real sera aberta para o cliente concluir o pagamento.'
    : needsTedBankFields
      ? 'Quando o admin aprovar, a TED sera enviada para os dados bancarios informados abaixo.'
      : null

  const amountPreview = useMemo(() => {
    const parsed = Number(String(amount).replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) return null

    return new Intl.NumberFormat(symbol === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: symbol,
    }).format(parsed)
  }, [amount, symbol])

  function updateBankField(field, value) {
    setBankAccount((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const parsed = Number(String(amount).replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) {
      setError(t('modal_invalid'))
      return
    }

    if (needsSavedCard && !selectedCardId) {
      setError('Cadastre e selecione um cartao para continuar com o deposito por cartao.')
      return
    }

    if (needsTedBankFields) {
      const requiredValues = [
        bankAccount.ownerName,
        bankAccount.cpfCnpj,
        bankAccount.bankCode,
        bankAccount.agency,
        bankAccount.account,
      ]

      if (requiredValues.some((value) => !String(value || '').trim())) {
        setError('Preencha os dados bancarios obrigatorios para TED.')
        return
      }
    }

    setSubmitting(true)
    setError('')

    try {
      const routeValue = note ? `${extra} - ${note}` : extra

      await onConfirm({
        symbol,
        amount: parsed,
        ...(isInvest
          ? { source: extra, note }
          : isDeposit
            ? { source: routeValue }
            : { destination: routeValue }),
        selectedCardId: needsSavedCard ? selectedCardId : null,
        payoutDetails: needsTedBankFields
          ? {
              method: 'TED',
              bankAccount: {
                ownerName: bankAccount.ownerName.trim(),
                cpfCnpj: bankAccount.cpfCnpj.replace(/\D/g, ''),
                bankCode: bankAccount.bankCode.replace(/\D/g, ''),
                agency: bankAccount.agency.replace(/\D/g, ''),
                account: bankAccount.account.replace(/\D/g, ''),
                accountDigit: bankAccount.accountDigit.replace(/\D/g, ''),
                bankAccountType: bankAccount.bankAccountType,
              },
            }
          : null,
      })
      onClose()
    } catch (submitError) {
      setError(submitError?.message || 'Nao foi possivel iniciar a operacao agora.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  const activeCurrencyClass = isInvest ? styles.currencyBtnActiveInvest : styles.currencyBtnActive
  const activeMethodClass = isInvest ? styles.methodCardActiveInvest : styles.methodCardActive
  const primaryBtnClass = isInvest ? styles.btnInvest : isDeposit ? styles.btnDeposit : styles.btnWithdraw

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className={`${styles.modal} corner-box${isInvest ? ` ${styles.modalInvest}` : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.head}>
          <div>
            <span className={styles.kicker}>
              {isInvest ? t('modal_invest_kicker') : isDeposit ? t('modal_deposit_kicker') : t('modal_withdraw_kicker')}
            </span>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('close_label')}>
            x
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.currencyToggle}>
            {['BRL', 'USD'].map((code) => (
              <button
                key={code}
                type="button"
                className={`${styles.currencyBtn} ${symbol === code ? activeCurrencyClass : ''}`}
                onClick={() => setSymbol(code)}
              >
                {code === 'BRL' ? t('currency_brl') : t('currency_usd')}
              </button>
            ))}
          </div>

          <label className={styles.label}>
            {t('modal_amount')}
            <div className={`${styles.amountField} corner-box`}>
              <span className={styles.amountPrefix}>{currencySymbol}</span>
              <input
                ref={inputRef}
                type="text"
                inputMode="decimal"
                placeholder={symbol === 'BRL' ? '0,00' : '0.00'}
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </div>
          </label>

          {amountPreview ? <p className={styles.amountPreview}>{amountPreview}</p> : null}

          <label className={styles.label}>
            {extraLabel}
            <div className={styles.methodGrid}>
              {extraOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.methodCard} ${extra === option ? activeMethodClass : ''}`}
                  onClick={() => setExtra(option)}
                >
                  <span className={styles.methodTitle}>{option}</span>
                  <span className={styles.methodDescription}>
                    {methodDescriptions[option] || 'Metodo disponivel para esta operacao.'}
                  </span>
                </button>
              ))}
            </div>
          </label>

          {needsSavedCard ? (
            <label className={styles.label}>
              Cartao salvo
              <select
                value={selectedCardId}
                onChange={(event) => setSelectedCardId(event.target.value)}
                className={`${styles.select} corner-box`}
              >
                {savedCards.length === 0 ? <option value="">Nenhum cartao salvo</option> : null}
                {savedCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.brand} · final {String(card.number || '').replace(/\D/g, '').slice(-4) || '0000'}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className={styles.label}>
            {t('modal_note')}
            <input
              type="text"
              className={`${styles.input} corner-box`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={isInvest ? t('modal_note_invest_ph') : isDeposit ? t('modal_note_deposit_ph') : t('modal_note_withdraw_ph')}
              maxLength={80}
            />
          </label>

          {needsTedBankFields ? (
            <div className={styles.bankGrid}>
              <label className={styles.label}>
                Titular da conta
                <input
                  type="text"
                  className={`${styles.input} corner-box`}
                  value={bankAccount.ownerName}
                  onChange={(event) => updateBankField('ownerName', event.target.value)}
                  placeholder="Nome completo do titular"
                />
              </label>

              <label className={styles.label}>
                CPF ou CNPJ
                <input
                  type="text"
                  className={`${styles.input} corner-box`}
                  value={bankAccount.cpfCnpj}
                  onChange={(event) => updateBankField('cpfCnpj', event.target.value.replace(/[^\d]/g, '').slice(0, 14))}
                  placeholder="Somente numeros"
                />
              </label>

              <label className={styles.label}>
                Codigo do banco
                <input
                  type="text"
                  className={`${styles.input} corner-box`}
                  value={bankAccount.bankCode}
                  onChange={(event) => updateBankField('bankCode', event.target.value.replace(/[^\d]/g, '').slice(0, 8))}
                  placeholder="Ex.: 341"
                />
              </label>

              <label className={styles.label}>
                Agencia
                <input
                  type="text"
                  className={`${styles.input} corner-box`}
                  value={bankAccount.agency}
                  onChange={(event) => updateBankField('agency', event.target.value.replace(/[^\d]/g, '').slice(0, 10))}
                  placeholder="Sem digito"
                />
              </label>

              <label className={styles.label}>
                Conta
                <input
                  type="text"
                  className={`${styles.input} corner-box`}
                  value={bankAccount.account}
                  onChange={(event) => updateBankField('account', event.target.value.replace(/[^\d]/g, '').slice(0, 16))}
                  placeholder="Numero da conta"
                />
              </label>

              <label className={styles.label}>
                Digito
                <input
                  type="text"
                  className={`${styles.input} corner-box`}
                  value={bankAccount.accountDigit}
                  onChange={(event) => updateBankField('accountDigit', event.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                  placeholder="Digito"
                />
              </label>

              <label className={styles.label}>
                Tipo da conta
                <select
                  value={bankAccount.bankAccountType}
                  onChange={(event) => updateBankField('bankAccountType', event.target.value)}
                  className={`${styles.select} corner-box`}
                >
                  <option value="CHECKING_ACCOUNT">Conta corrente</option>
                  <option value="SAVINGS_ACCOUNT">Conta poupanca</option>
                </select>
              </label>
            </div>
          ) : null}

          {providerHint ? <p className={styles.helper}>{providerHint}</p> : null}
          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={onClose} disabled={submitting}>
              {t('modal_cancel')}
            </button>
            <button type="submit" className={`${styles.btnPrimary} ${primaryBtnClass}`} disabled={submitting}>
              {submitting ? 'Processando...' : actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
