import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  collection,
  doc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import { loadWorkspaceData } from '../lib/firestoreService.js'
import { db, hasFirebaseConfig } from '../lib/firebase.js'
import {
  getUserInbox,
  markUserNotificationRead,
  sendApprovalToUser,
  sendDepositRequestToAdmin,
  sendRejectionToUser,
  sendWithdrawRequestToAdmin,
} from '../lib/mockEmailService.js'
import { ADMIN_NOTIFICATION_EMAIL, sendAdminApprovalRequestEmail } from '../lib/emailService.js'
import { createRealDepositCharge, isRealPaymentsEnabled } from '../lib/paymentGateway.js'
import { useAuth } from './AuthContext.jsx'

const WorkspaceContext = createContext(null)

function nowLabel() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `Hoje, ${hh}:${mm}`
}

function formatDateTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return nowLabel()
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function normalizeTimestamp(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

function sortByTimestampDesc(items, field = 'createdAt') {
  return [...items].sort((a, b) => {
    const aTime = normalizeTimestamp(a[field])?.getTime() ?? 0
    const bTime = normalizeTimestamp(b[field])?.getTime() ?? 0
    return bTime - aTime
  })
}

function defaultWalletFor(symbol) {
  return symbol === 'USD'
    ? { id: 'usd', symbol: 'USD', name: 'Dólar americano', color: '#4a7fdb', change: '+0,0%', up: true }
    : { id: 'brl', symbol: 'BRL', name: 'Real brasileiro', color: '#3ecf8e', change: '+0,0%', up: true }
}

function mapRequestDoc(item) {
  const createdAt = normalizeTimestamp(item.createdAt)
  const resolvedAt = normalizeTimestamp(item.resolvedAt)

  return {
    ...item,
    createdAtLabel: item.createdAtLabel || formatDateTime(createdAt),
    resolvedAtLabel: resolvedAt ? formatDateTime(resolvedAt) : item.resolvedAtLabel || null,
  }
}

function mapNotificationDoc(item) {
  const createdAt = normalizeTimestamp(item.createdAt)

  return {
    ...item,
    sentAt: item.sentAt || formatDateTime(createdAt),
  }
}

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

function buildTransactionLabelFromRequest(request) {
  const currencyLabel = request.symbol === 'BRL' ? 'real' : 'dólar'

  if (request.status === 'approved') {
    return request.type === 'deposit'
      ? `Depósito aprovado em ${currencyLabel}`
      : `Saque aprovado em ${currencyLabel}`
  }

  if (request.status === 'rejected') {
    return request.type === 'deposit' ? 'Depósito recusado' : 'Saque recusado'
  }

  return request.type === 'deposit'
    ? `Depósito em ${currencyLabel} — aguardando resposta do admin`
    : `Saque em ${currencyLabel} — aguardando resposta do admin`
}

function mergeTransactionsWithRequests(transactions, requests) {
  if (!Array.isArray(transactions) || transactions.length === 0) return transactions
  if (!Array.isArray(requests) || requests.length === 0) return transactions

  const requestsByRequestId = new Map()
  const requestsByTxId = new Map()

  requests.forEach((item) => {
    if (item?.requestId) requestsByRequestId.set(item.requestId, item)
    if (item?.txId) requestsByTxId.set(item.txId, item)
  })

  return transactions.map((transaction) => {
    const linkedRequest = requestsByTxId.get(transaction.id) || requestsByRequestId.get(transaction.requestId)
    if (!linkedRequest) return transaction

    return {
      ...transaction,
      status: linkedRequest.status === 'approved'
        ? 'completed'
        : linkedRequest.status === 'rejected'
          ? 'rejected'
          : 'pending',
      label: buildTransactionLabelFromRequest(linkedRequest),
      from: linkedRequest.type === 'deposit'
        ? (linkedRequest.source || transaction.from)
        : (linkedRequest.destination || transaction.from),
      time: linkedRequest.status === 'pending'
        ? transaction.time
        : (linkedRequest.resolvedAtLabel || transaction.time),
      resolutionReason: linkedRequest.resolutionReason || transaction.resolutionReason || null,
    }
  })
}

export function WorkspaceProvider({ children }) {
  const { user, demoMode } = useAuth()
  const [state, setState] = useState({
    loading: true,
    wallets: { data: [], status: 'loading' },
    transactions: { data: [], status: 'loading' },
    cards: { data: [], status: 'loading' },
    bankAccounts: { data: [], status: 'loading' },
    exchangeRates: { data: [], status: 'loading' },
    securityEvents: { data: [], status: 'loading' },
    settings: { data: [], status: 'loading' },
  })
  const [adminRequests, setAdminRequests] = useState([])
  const [userRequests, setUserRequests] = useState([])
  const [userNotifications, setUserNotifications] = useState([])

  const canUseRealtimeFlow = Boolean(hasFirebaseConfig && db)

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

  useEffect(() => {
    if (!canUseRealtimeFlow) return undefined

    const adminRequestsRef = query(collection(db, 'adminRequests'), orderBy('createdAt', 'desc'))

    return onSnapshot(
      adminRequestsRef,
      (snapshot) => {
        setAdminRequests(snapshot.docs.map((item) => mapRequestDoc({ id: item.id, ...item.data() })))
      },
      () => {
        setAdminRequests([])
      },
    )
  }, [canUseRealtimeFlow])

  useEffect(() => {
    if (!canUseRealtimeFlow || !user?.uid) {
      setUserRequests([])
      return undefined
    }

    const userRequestsRef = query(collection(db, 'adminRequests'), where('userUid', '==', user.uid))

    return onSnapshot(
      userRequestsRef,
      (snapshot) => {
        const rows = snapshot.docs.map((item) => mapRequestDoc({ id: item.id, ...item.data() }))
        setUserRequests(sortByTimestampDesc(rows))
      },
      () => {
        setUserRequests([])
      },
    )
  }, [canUseRealtimeFlow, user?.uid])

  useEffect(() => {
    if (!canUseRealtimeFlow || !user?.uid) {
      setUserNotifications(user?.email ? getUserInbox(user.email) : [])
      return undefined
    }

    const notificationsRef = query(collection(db, 'users', user.uid, 'notifications'), orderBy('createdAt', 'desc'))

    return onSnapshot(
      notificationsRef,
      (snapshot) => {
        const rows = snapshot.docs
          .map((item) => mapNotificationDoc({ id: item.id, ...item.data() }))
          .filter((item) => !item.read)
        setUserNotifications(rows)
      },
      () => {
        setUserNotifications([])
      },
    )
  }, [canUseRealtimeFlow, user?.uid, user?.email])

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
        data: prev.transactions.data.map((tx) => (tx.id === txId ? { ...tx, ...patch } : tx)),
      },
    }))
  }, [])

  const addCard = useCallback(async (card) => {
    const cardId = card?.id || `card-${Date.now()}`
    const payload = {
      ...card,
      id: cardId,
      createdAtLabel: nowLabel(),
      deleted: false,
    }

    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        data: [payload, ...prev.cards.data.filter((item) => item.id !== cardId && !item.deleted)],
      },
    }))

    if (!canUseRealtimeFlow || !user?.uid || demoMode) {
      return payload
    }

    await setDoc(doc(db, 'users', user.uid, 'cards', cardId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true })

    return payload
  }, [canUseRealtimeFlow, demoMode, user?.uid])

  const removeCard = useCallback(async (cardId) => {
    setState((prev) => ({
      ...prev,
      cards: {
        ...prev.cards,
        data: prev.cards.data.filter((item) => item.id !== cardId),
      },
    }))

    if (!canUseRealtimeFlow || !user?.uid || demoMode || !cardId) {
      return
    }

    await setDoc(doc(db, 'users', user.uid, 'cards', cardId), {
      deleted: true,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  }, [canUseRealtimeFlow, demoMode, user?.uid])

  const upsertBankAccountState = useCallback((bankProfile) => {
    if (!bankProfile?.id) return

    setState((prev) => {
      const exists = prev.bankAccounts.data.some((item) => item.id === bankProfile.id)
      return {
        ...prev,
        bankAccounts: {
          ...prev.bankAccounts,
          data: exists
            ? prev.bankAccounts.data.map((item) => (item.id === bankProfile.id ? { ...item, ...bankProfile } : item))
            : [bankProfile, ...prev.bankAccounts.data],
        },
      }
    })
  }, [])

  const submitRequest = useCallback(
    async ({ type, symbol, amount, source, destination, payoutDetails, selectedCardId }) => {
      const numeric = Number(amount) || 0
      if (numeric <= 0) return null

      const requestId = `req-${Date.now()}`
      const txId = `tx-${Date.now()}`
      const formatted = formatCurrency(numeric, symbol)
      const createdAtLabel = nowLabel()
      const userEmail = user?.email || 'cliente@oceancapital.com'
      const userName = user?.displayName || userEmail || 'Cliente Ocean Capital'
      const wallet = state.wallets.data.find((item) => item.symbol === symbol) ?? defaultWalletFor(symbol)
      const tx = {
        id: txId,
        type: type === 'deposit' ? 'receive' : 'send',
        label: type === 'deposit'
          ? `Depósito em ${symbol === 'BRL' ? 'real' : 'dólar'} — aguardando resposta do admin`
          : `Saque em ${symbol === 'BRL' ? 'real' : 'dólar'} — aguardando resposta do admin`,
        from: source || destination || (symbol === 'BRL' ? 'TED' : 'Transferência'),
        amount: type === 'deposit' ? formatSigned(numeric, symbol) : formatSigned(-numeric, symbol),
        time: createdAtLabel,
        status: 'pending',
        currency: symbol,
        native: type === 'deposit' ? numeric : -numeric,
        requestId,
      }

      addTransaction(tx)

      const requestPayload = {
        requestId,
        txId,
        walletId: wallet.id || symbol.toLowerCase(),
        type,
        symbol,
        amount: numeric,
        source: source || null,
        destination: destination || null,
        formattedAmount: formatted,
        userUid: user?.uid || null,
        userEmail,
        userName,
        status: 'pending',
        createdAtLabel,
        payoutDetails: payoutDetails || null,
        selectedCardId: selectedCardId || null,
      }

      const bankProfile = payoutDetails?.bankAccount
        ? {
            id: 'primary-bank-account',
            label: payoutDetails.method || 'TED',
            ownerName: payoutDetails.bankAccount.ownerName || '',
            cpfCnpj: payoutDetails.bankAccount.cpfCnpj || '',
            bankCode: payoutDetails.bankAccount.bankCode || '',
            agency: payoutDetails.bankAccount.agency || '',
            account: payoutDetails.bankAccount.account || '',
            accountDigit: payoutDetails.bankAccount.accountDigit || '',
            bankAccountType: payoutDetails.bankAccount.bankAccountType || 'CHECKING_ACCOUNT',
            updatedAtLabel: createdAtLabel,
          }
        : null

      if (!canUseRealtimeFlow || !user?.uid || demoMode) {
        if (bankProfile) {
          upsertBankAccountState(bankProfile)
        }
        setAdminRequests((prev) => [requestPayload, ...prev])
        setUserRequests((prev) => [requestPayload, ...prev])

        if (type === 'deposit') {
          sendDepositRequestToAdmin({ requestId, userEmail, symbol, amount: numeric, source, formattedAmount: formatted })
        } else {
          sendWithdrawRequestToAdmin({ requestId, userEmail, symbol, amount: numeric, destination, formattedAmount: formatted })
        }

        return requestPayload
      }

      const txRef = doc(db, 'users', user.uid, 'transactions', txId)
      const requestRef = doc(collection(db, 'adminRequests'))
      const bankRef = bankProfile ? doc(db, 'users', user.uid, 'bankAccounts', bankProfile.id) : null

      await setDoc(txRef, {
        ...tx,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      await setDoc(requestRef, {
        ...requestPayload,
        requestId: requestRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailStatus: 'processing',
        emailProvider: 'emailjs',
        adminEmail: ADMIN_NOTIFICATION_EMAIL,
      })

      if (bankProfile && bankRef) {
        await setDoc(bankRef, {
          ...bankProfile,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true })
        upsertBankAccountState(bankProfile)
      }

      const emailResult = await sendAdminApprovalRequestEmail({
        requestId: requestRef.id,
        userName,
        userEmail,
        type,
        symbol,
        formattedAmount: formatted,
        source,
        destination,
        createdAtLabel,
      })

      await updateDoc(requestRef, {
        emailStatus: emailResult.ok ? 'sent' : emailResult.skipped ? 'skipped' : 'failed',
        emailError: emailResult.ok ? null : emailResult.error || null,
        updatedAt: serverTimestamp(),
      })

      return {
        ...requestPayload,
        requestId: requestRef.id,
        emailStatus: emailResult.ok ? 'sent' : emailResult.skipped ? 'skipped' : 'failed',
      }
    },
    [addTransaction, canUseRealtimeFlow, demoMode, state.wallets.data, upsertBankAccountState, user],
  )

  const approveRequest = useCallback(
    async (requestId) => {
      const req = adminRequests.find((item) => item.requestId === requestId || item.id === requestId)
      if (!req) return

      const resolvedAtLabel = nowLabel()
      const savedCard = req.selectedCardId ? state.cards.data.find((item) => item.id === req.selectedCardId) : null
      let paymentResult = null

      if (
        req.type === 'deposit'
        && req.symbol === 'BRL'
        && String(req.source || '').toLowerCase().includes('cart')
        && savedCard?.providerToken
        && isRealPaymentsEnabled()
      ) {
        paymentResult = await createRealDepositCharge({
          requestId: req.requestId,
          userUid: req.userUid,
          userName: req.userName,
          userEmail: req.userEmail,
          symbol: req.symbol,
          amount: req.amount,
          source: req.source,
          card: {
            id: savedCard.id,
            providerToken: savedCard.providerToken,
            cpfCnpj: savedCard.cpfCnpj,
            mobilePhone: savedCard.mobilePhone,
            postalCode: savedCard.postalCode,
            addressNumber: savedCard.addressNumber,
          },
        })
      }

      if (!canUseRealtimeFlow || !req.userUid || demoMode) {
        const delta = req.type === 'deposit' ? req.amount : -req.amount
        updateWalletBalance(req.symbol, delta)
        updateTransaction(req.txId, {
          status: 'completed',
          label: req.type === 'deposit'
            ? `Depósito em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`
            : `Saque em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`,
        })
        setAdminRequests((prev) => prev.map((item) => (
          item.requestId === requestId ? { ...item, status: 'approved', resolvedAtLabel } : item
        )))
        setUserRequests((prev) => prev.map((item) => (
          item.requestId === requestId ? { ...item, status: 'approved', resolvedAtLabel } : item
        )))
        sendApprovalToUser({ userEmail: req.userEmail, type: req.type, formattedAmount: req.formattedAmount })
        setUserNotifications(getUserInbox(req.userEmail))
        return
      }

      const walletModel = state.wallets.data.find((item) => item.symbol === req.symbol) ?? defaultWalletFor(req.symbol)
      const delta = req.type === 'deposit' ? req.amount : -req.amount
      const requestDocId = req.id || req.requestId
      const completedLabel = req.type === 'deposit'
        ? `Depósito em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`
        : `Saque em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`

      // 1. Atualiza adminRequests (admin sempre tem permissão aqui)
      await setDoc(doc(db, 'adminRequests', requestDocId), {
        status: 'approved',
        resolvedAt: serverTimestamp(),
        resolvedAtLabel,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      // Atualiza estado local imediatamente após confirmar o write do adminRequests
      setAdminRequests((prev) => prev.map((item) => (
        item.requestId === requestId ? { ...item, status: 'approved', resolvedAtLabel } : item
      )))
      setUserRequests((prev) => prev.map((item) => (
        item.requestId === requestId ? { ...item, status: 'approved', resolvedAtLabel } : item
      )))
      updateWalletBalance(req.symbol, delta)
      updateTransaction(req.txId, { status: 'completed', label: completedLabel })

      // 2. Atualiza subcoleções do cliente (best-effort — pode falhar por regras do Firestore)
      try {
        const txRef = doc(db, 'users', req.userUid, 'transactions', req.txId)
        const walletRef = doc(db, 'users', req.userUid, 'wallets', req.walletId || walletModel.id)
        const notificationRef = doc(collection(db, 'users', req.userUid, 'notifications'))
        const userBatch = writeBatch(db)

        userBatch.set(walletRef, {
          id: req.walletId || walletModel.id,
          symbol: req.symbol,
          name: walletModel.name,
          native: increment(delta),
          color: walletModel.color,
          change: walletModel.change || '+0,0%',
          up: true,
          updatedAt: serverTimestamp(),
        }, { merge: true })

        userBatch.set(txRef, {
          status: 'completed',
          label: completedLabel,
          resolvedAtLabel,
          updatedAt: serverTimestamp(),
        }, { merge: true })

        userBatch.set(notificationRef, {
          type: 'approval',
          subject: `Seu pedido de ${req.type === 'deposit' ? 'depósito' : 'saque'} foi aceito`,
          body: `O administrador aprovou sua solicitação de <strong>${req.formattedAmount}</strong>.`,
          from: ADMIN_NOTIFICATION_EMAIL,
          read: false,
          createdAt: serverTimestamp(),
          sentAt: resolvedAtLabel,
        })

        await userBatch.commit()
      } catch {
        // Falha nas subcoleções do cliente (regras do Firestore) — adminRequests já foi atualizado
      }
    },
    [adminRequests, canUseRealtimeFlow, demoMode, state.wallets.data, updateTransaction, updateWalletBalance],
  )

  const rejectRequest = useCallback(
    async (requestId, reason) => {
      const req = adminRequests.find((item) => item.requestId === requestId || item.id === requestId)
      if (!req) return

      const resolvedAtLabel = nowLabel()
      const finalReason = reason?.trim() || null

      if (!canUseRealtimeFlow || !req.userUid || demoMode) {
        updateTransaction(req.txId, {
          status: 'rejected',
          label: req.type === 'deposit' ? 'Depósito recusado' : 'Saque recusado',
        })
        setAdminRequests((prev) => prev.map((item) => (
          item.requestId === requestId ? { ...item, status: 'rejected', resolvedAtLabel, resolutionReason: finalReason } : item
        )))
        setUserRequests((prev) => prev.map((item) => (
          item.requestId === requestId ? { ...item, status: 'rejected', resolvedAtLabel, resolutionReason: finalReason } : item
        )))
        sendRejectionToUser({ userEmail: req.userEmail, type: req.type, formattedAmount: req.formattedAmount, reason: finalReason })
        setUserNotifications(getUserInbox(req.userEmail))
        return
      }

      const requestDocId = req.id || req.requestId
      const rejectedLabel = req.type === 'deposit' ? 'Depósito recusado' : 'Saque recusado'

      // 1. Atualiza adminRequests (admin sempre tem permissão aqui)
      await setDoc(doc(db, 'adminRequests', requestDocId), {
        status: 'rejected',
        resolvedAt: serverTimestamp(),
        resolvedAtLabel,
        resolutionReason: finalReason,
        updatedAt: serverTimestamp(),
      }, { merge: true })

      // Atualiza estado local imediatamente após confirmar o write do adminRequests
      setAdminRequests((prev) => prev.map((item) => (
        item.requestId === requestId ? { ...item, status: 'rejected', resolvedAtLabel, resolutionReason: finalReason } : item
      )))
      setUserRequests((prev) => prev.map((item) => (
        item.requestId === requestId ? { ...item, status: 'rejected', resolvedAtLabel, resolutionReason: finalReason } : item
      )))
      updateTransaction(req.txId, { status: 'rejected', label: rejectedLabel })

      // 2. Atualiza subcoleções do cliente (best-effort — pode falhar por regras do Firestore)
      try {
        const txRef = doc(db, 'users', req.userUid, 'transactions', req.txId)
        const notificationRef = doc(collection(db, 'users', req.userUid, 'notifications'))
        const userBatch = writeBatch(db)

        userBatch.set(txRef, {
          status: 'rejected',
          label: rejectedLabel,
          resolutionReason: finalReason,
          resolvedAtLabel,
          updatedAt: serverTimestamp(),
        }, { merge: true })

        userBatch.set(notificationRef, {
          type: 'rejection',
          subject: `Seu pedido de ${req.type === 'deposit' ? 'depósito' : 'saque'} foi recusado`,
          body: finalReason
            ? `O administrador recusou sua solicitação de <strong>${req.formattedAmount}</strong>.<br/><br/>Motivo: ${finalReason}`
            : `O administrador recusou sua solicitação de <strong>${req.formattedAmount}</strong>.`,
          from: ADMIN_NOTIFICATION_EMAIL,
          read: false,
          createdAt: serverTimestamp(),
          sentAt: resolvedAtLabel,
        })

        await userBatch.commit()
      } catch {
        // Falha nas subcoleções do cliente (regras do Firestore) — adminRequests já foi atualizado
      }
    },
    [adminRequests, canUseRealtimeFlow, demoMode, updateTransaction],
  )

  const refreshUserNotifications = useCallback(() => {
    if (canUseRealtimeFlow) return
    const email = user?.email || 'cliente@oceancapital.com'
    setUserNotifications(getUserInbox(email))
  }, [canUseRealtimeFlow, user?.email])

  const dismissNotification = useCallback(async (msgId) => {
    if (!canUseRealtimeFlow || !user?.uid) {
      const email = user?.email || 'cliente@oceancapital.com'
      markUserNotificationRead(email, msgId)
      setUserNotifications((prev) => prev.filter((item) => item.id !== msgId))
      return
    }

    const notificationRef = doc(db, 'users', user.uid, 'notifications', msgId)
    await updateDoc(notificationRef, {
      read: true,
      updatedAt: serverTimestamp(),
    })
  }, [canUseRealtimeFlow, user?.email, user?.uid])

  const deposit = useCallback(
    ({ symbol, amount, source }) => submitRequest({ type: 'deposit', symbol, amount, source }),
    [submitRequest],
  )

  const withdraw = useCallback(
    ({ symbol, amount, destination }) => submitRequest({ type: 'withdraw', symbol, amount, destination }),
    [submitRequest],
  )

  const pendingRequests = useMemo(
    () => adminRequests.filter((item) => item.status === 'pending'),
    [adminRequests],
  )

  const resolvedRequests = useMemo(
    () => adminRequests.filter((item) => item.status !== 'pending'),
    [adminRequests],
  )

  const mergedTransactions = useMemo(
    () => mergeTransactionsWithRequests(state.transactions.data, userRequests),
    [state.transactions.data, userRequests],
  )

  const value = useMemo(
    () => ({
      loading: state.loading,
      wallets: state.wallets,
      transactions: {
        ...state.transactions,
        data: mergedTransactions,
      },
      cards: state.cards,
      bankAccounts: state.bankAccounts,
      exchangeRates: state.exchangeRates,
      securityEvents: state.securityEvents,
      settings: state.settings,
      pendingRequests,
      resolvedRequests,
      userRequests,
      userNotifications,
      submitRequest,
      approveRequest,
      rejectRequest,
      refreshUserNotifications,
      dismissNotification,
      addCard,
      removeCard,
      deposit,
      withdraw,
    }),
    [
      state,
      mergedTransactions,
      pendingRequests,
      resolvedRequests,
      userRequests,
      userNotifications,
      submitRequest,
      approveRequest,
      rejectRequest,
      refreshUserNotifications,
      dismissNotification,
      addCard,
      removeCard,
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
