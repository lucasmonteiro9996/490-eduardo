import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { loadWorkspaceData } from '../lib/firestoreService.js'
import {
  sendDepositRequestToAdmin,
  sendWithdrawRequestToAdmin,
  sendApprovalToUser,
  sendRejectionToUser,
  getUserInbox,
  markUserNotificationRead,
} from '../lib/mockEmailService.js'
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

  // Solicitações pendentes aguardando aprovação do admin
  const [pendingRequests, setPendingRequests] = useState([])

  // Notificações do usuário (respostas do admin)
  const [userNotifications, setUserNotifications] = useState([])

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

  // ── Helpers internos ─────────────────────────────────────────────────────

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

  const updateTransaction = useCallback((txId, patch) => {
    setState((prev) => ({
      ...prev,
      transactions: {
        ...prev.transactions,
        data: prev.transactions.data.map((tx) =>
          tx.id === txId ? { ...tx, ...patch } : tx,
        ),
      },
    }))
  }, [])

  // ── submitRequest — cria pendência sem mexer no saldo ────────────────────

  const submitRequest = useCallback(
    ({ type, symbol, amount, source, destination }) => {
      const numeric = Number(amount) || 0
      if (numeric <= 0) return null

      const requestId = `req-${Date.now()}`
      const txId = `tx-${Date.now()}`
      const formatted = formatCurrency(numeric, symbol)
      const userEmail = user?.email || 'cliente@oceancapital.com'

      // Transação pendente (sem saldo mudado ainda)
      const tx = {
        id: txId,
        type: type === 'deposit' ? 'receive' : 'send',
        label: type === 'deposit'
          ? `Depósito em ${symbol === 'BRL' ? 'real' : 'dólar'} — aguardando`
          : `Saque em ${symbol === 'BRL' ? 'real' : 'dólar'} — aguardando`,
        from: source || destination || (symbol === 'BRL' ? 'PIX' : 'Transferência'),
        amount: type === 'deposit' ? formatSigned(numeric, symbol) : formatSigned(-numeric, symbol),
        time: nowLabel(),
        status: 'pending',
        currency: symbol,
        native: type === 'deposit' ? numeric : -numeric,
      }

      addTransaction(tx)

      // Registra solicitação pendente
      const request = {
        requestId,
        txId,
        type,
        symbol,
        amount: numeric,
        source: source || null,
        destination: destination || null,
        formattedAmount: formatted,
        userEmail,
        createdAt: nowLabel(),
      }
      setPendingRequests((prev) => [request, ...prev])

      // Envia email mockado ao admin
      if (type === 'deposit') {
        sendDepositRequestToAdmin({ requestId, userEmail, symbol, amount: numeric, source, formattedAmount: formatted })
      } else {
        sendWithdrawRequestToAdmin({ requestId, userEmail, symbol, amount: numeric, destination, formattedAmount: formatted })
      }

      return request
    },
    [user, addTransaction],
  )

  // ── approveRequest — aplica saldo e notifica usuário ────────────────────

  const approveRequest = useCallback(
    (requestId) => {
      const req = pendingRequests.find((r) => r.requestId === requestId)
      if (!req) return

      // Aplica o saldo
      const delta = req.type === 'deposit' ? req.amount : -req.amount
      updateWalletBalance(req.symbol, delta)

      // Atualiza transação para concluída
      updateTransaction(req.txId, {
        status: 'completed',
        label: req.type === 'deposit'
          ? `Depósito em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`
          : `Saque em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`,
      })

      // Remove da lista de pendentes
      setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId))

      // Envia email de aprovação ao usuário
      sendApprovalToUser({ userEmail: req.userEmail, type: req.type, formattedAmount: req.formattedAmount })

      // Atualiza notificações do usuário em tela
      setUserNotifications(getUserInbox(req.userEmail))
    },
    [pendingRequests, updateWalletBalance, updateTransaction],
  )

  // ── rejectRequest — cancela e notifica usuário ───────────────────────────

  const rejectRequest = useCallback(
    (requestId, reason) => {
      const req = pendingRequests.find((r) => r.requestId === requestId)
      if (!req) return

      // Atualiza transação para recusada
      updateTransaction(req.txId, {
        status: 'rejected',
        label: req.type === 'deposit'
          ? `Depósito recusado`
          : `Saque recusado`,
      })

      // Remove da lista de pendentes
      setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId))

      // Envia email de recusa ao usuário
      sendRejectionToUser({ userEmail: req.userEmail, type: req.type, formattedAmount: req.formattedAmount, reason })

      // Atualiza notificações do usuário em tela
      setUserNotifications(getUserInbox(req.userEmail))
    },
    [pendingRequests, updateTransaction],
  )

  // ── Manter notificações sincronizadas com o inbox mockado ────────────────

  const refreshUserNotifications = useCallback(() => {
    const email = user?.email || 'cliente@oceancapital.com'
    setUserNotifications(getUserInbox(email))
  }, [user])

  const dismissNotification = useCallback((msgId) => {
    const email = user?.email || 'cliente@oceancapital.com'
    markUserNotificationRead(email, msgId)
    setUserNotifications((prev) => prev.filter((n) => n.id !== msgId))
  }, [user])

  // ─────────────────────────────────────────────────────────────────────────

  // Manter compatibilidade: deposit/withdraw legados redirecionam para submitRequest
  const deposit = useCallback(
    ({ symbol, amount, source }) => submitRequest({ type: 'deposit', symbol, amount, source }),
    [submitRequest],
  )

  const withdraw = useCallback(
    ({ symbol, amount, destination }) => submitRequest({ type: 'withdraw', symbol, amount, destination }),
    [submitRequest],
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
      // Fluxo de aprovação
      pendingRequests,
      userNotifications,
      submitRequest,
      approveRequest,
      rejectRequest,
      refreshUserNotifications,
      dismissNotification,
      // Legado
      deposit,
      withdraw,
    }),
    [
      state,
      pendingRequests,
      userNotifications,
      submitRequest,
      approveRequest,
      rejectRequest,
      refreshUserNotifications,
      dismissNotification,
      deposit,
      withdraw,
    ],
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace precisa estar dentro de WorkspaceProvider.')
  return ctx
}
