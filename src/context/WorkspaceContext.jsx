import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadWorkspaceData } from '../lib/firestoreService.js'
import { useAuth } from './AuthContext.jsx'

const WorkspaceContext = createContext(null)

export function formatCurrency(amount, symbol) {
  const absValue = Math.abs(Number(amount) || 0)
  if (symbol === 'BRL') {
    return `R$ ${absValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
  return `$ ${absValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatSigned(amount, symbol) {
  const sign = amount >= 0 ? '+' : '-'
  const abs = formatCurrency(amount, symbol)
  return `${sign}${abs.replace(/\s/, '')}`
}

function nowLabel() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `Hoje, ${hh}:${mm}`
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
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
      if (!active) return
      setState({ loading: false, ...result })
    })
    return () => {
      active = false
    }
  }, [user?.uid])

  const updateWalletBalance = useCallback((symbol, delta) => {
    setState((prev) => ({
      ...prev,
      wallets: {
        ...prev.wallets,
        data: prev.wallets.data.map((wallet) => {
          if (wallet.symbol !== symbol) return wallet
          const native = (Number(wallet.native) || 0) + delta
          return { ...wallet, native }
        }),
      },
    }))
  }, [])

  const addTransaction = useCallback((tx) => {
    setState((prev) => ({
      ...prev,
      transactions: {
        ...prev.transactions,
        data: [tx, ...prev.transactions.data],
      },
    }))
  }, [])

  const deposit = useCallback(
    ({ symbol, amount, source }) => {
      const numeric = Number(amount) || 0
      if (numeric <= 0) return null
      updateWalletBalance(symbol, numeric)
      const tx = {
        id: `tx-${Date.now()}`,
        type: 'receive',
        label: `Depósito em ${symbol === 'BRL' ? 'real' : 'dólar'}`,
        from: source || (symbol === 'BRL' ? 'PIX' : 'Transferência internacional'),
        amount: formatSigned(numeric, symbol),
        time: nowLabel(),
        status: 'completed',
        currency: symbol,
        native: numeric,
      }
      addTransaction(tx)
      return tx
    },
    [addTransaction, updateWalletBalance],
  )

  const withdraw = useCallback(
    ({ symbol, amount, destination }) => {
      const numeric = Number(amount) || 0
      if (numeric <= 0) return null
      updateWalletBalance(symbol, -numeric)
      const tx = {
        id: `tx-${Date.now()}`,
        type: 'send',
        label: `Saque em ${symbol === 'BRL' ? 'real' : 'dólar'}`,
        from: destination || (symbol === 'BRL' ? 'Saída via PIX' : 'Transferência internacional'),
        amount: formatSigned(-numeric, symbol),
        time: nowLabel(),
        status: 'completed',
        currency: symbol,
        native: -numeric,
      }
      addTransaction(tx)
      return tx
    },
    [addTransaction, updateWalletBalance],
  )

  const value = useMemo(
    () => ({
      loading: state.loading,
      wallets: state.wallets,
      transactions: state.transactions,
      cards: state.cards,
      exchangeRates: state.exchangeRates,
      securityEvents: state.securityEvents,
      settings: state.settings,
      deposit,
      withdraw,
    }),
    [state, deposit, withdraw],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace precisa estar dentro de WorkspaceProvider.')
  return ctx
}
