import { useEffect, useMemo, useRef, useState } from 'react'
import { usePreferences } from '../context/PreferencesContext.jsx'
import styles from './MoneyModal.module.css'

const depositSources = {
  BRL: ['Cartão', 'TED', 'Boleto bancário'],
  USD: ['Transferência internacional (SWIFT)', 'Wire transfer', 'ACH', 'Depósito em conta corrente'],
}

const withdrawDestinations = {
  BRL: ['Cartão', 'TED', 'Boleto bancário'],
  USD: ['Transferência internacional (SWIFT)', 'Wire transfer', 'ACH', 'Saque em caixa 24h'],
}

export default function MoneyModal({ mode, open, onClose, onConfirm }) {
  const { t } = usePreferences()
  const [symbol, setSymbol] = useState('BRL')
  const [amount, setAmount] = useState('')
  const [extra, setExtra] = useState(mode === 'deposit' ? depositSources.BRL[0] : withdrawDestinations.BRL[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setAmount('')
      setNote('')
      setError('')
      setSymbol('BRL')
      setExtra(mode === 'deposit' ? depositSources.BRL[0] : withdrawDestinations.BRL[0])
      setTimeout(() => inputRef.current?.focus(), 40)
    }
  }, [open, mode])

  useEffect(() => {
    const options = mode === 'deposit' ? depositSources[symbol] : withdrawDestinations[symbol]
    setExtra(options[0])
  }, [symbol, mode])

  if (!open) return null

  const isDeposit = mode === 'deposit'
  const title = isDeposit ? t('deposit') : t('withdraw')

  const amountPreview = useMemo(() => {
    const parsed = Number(String(amount).replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) return null
    return new Intl.NumberFormat(symbol === 'BRL' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: symbol,
    }).format(parsed)
  }, [amount, symbol])
  const actionLabel = isDeposit ? t('modal_deposit_action') : t('modal_withdraw_action')
  const extraLabel = isDeposit ? t('modal_origin') : t('modal_dest')
  const extraOptions = isDeposit ? depositSources[symbol] : withdrawDestinations[symbol]
  const currencySymbol = symbol === 'BRL' ? 'R$' : '$'

  function handleSubmit(event) {
    event.preventDefault()
    const parsed = Number(String(amount).replace(/\./g, '').replace(',', '.'))
    if (!parsed || parsed <= 0) {
      setError(t('modal_invalid'))
      return
    }
    onConfirm({
      symbol,
      amount: parsed,
      [isDeposit ? 'source' : 'destination']: note ? `${extra} - ${note}` : extra,
    })
    onClose()
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={`${styles.modal} corner-box`} onClick={(event) => event.stopPropagation()}>
        <div className={styles.head}>
          <div>
            <span className={styles.kicker}>{isDeposit ? t('modal_deposit_kicker') : t('modal_withdraw_kicker')}</span>
            <h3 className={styles.title}>{title}</h3>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t('close_label')}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.currencyToggle}>
            {['BRL', 'USD'].map((code) => (
              <button
                key={code}
                type="button"
                className={`${styles.currencyBtn} ${symbol === code ? styles.currencyBtnActive : ''}`}
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

          {amountPreview && (
            <p className={styles.amountPreview}>{amountPreview}</p>
          )}

          <label className={styles.label}>
            {extraLabel}
            <select value={extra} onChange={(event) => setExtra(event.target.value)} className={`${styles.select} corner-box`}>
              {extraOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.label}>
            {t('modal_note')}
            <input
              type="text"
              className={`${styles.input} corner-box`}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder={isDeposit ? t('modal_note_deposit_ph') : t('modal_note_withdraw_ph')}
              maxLength={80}
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <div className={styles.actions}>
            <button type="button" className={styles.btnGhost} onClick={onClose}>
              {t('modal_cancel')}
            </button>
            <button type="submit" className={`${styles.btnPrimary} ${isDeposit ? styles.btnDeposit : styles.btnWithdraw}`}>
              {actionLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
