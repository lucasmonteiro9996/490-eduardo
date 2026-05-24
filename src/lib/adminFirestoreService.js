import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore'
import { db, hasFirebaseConfig } from './firebase.js'
import {
  computeSyncedWalletsAfterMovement,
  computeSyncedWalletsFromDelta,
  getTotalUsdFromWallets,
  reconcileWalletBalances,
  walletPatrimonyFields,
} from './currencyConversion.js'
import { fetchBrlToUsd } from './exchangeRateService.js'

const CLIENT_COLORS = ['#4a7fdb', '#3ecf8e', '#a78bfa', '#f5c842', '#34d8b6', '#f97316']

function normalizeTimestamp(value) {
  if (!value) return null
  if (value instanceof Date) return value
  if (typeof value?.toDate === 'function') return value.toDate()
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

function formatAmount(native, symbol) {
  const sign = native >= 0 ? '+' : '-'
  const abs = Math.abs(Number(native) || 0)

  if (symbol === 'BRL') {
    return `${sign}R$${abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatDateLabel(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Sem data'

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getInitials(name, email) {
  const source = String(name || email || 'OC').trim()
  const parts = source.split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

function inferStatus(transactions) {
  if (transactions.some((item) => item.status === 'rejected')) return 'suspended'
  if (transactions.length === 0) return 'pending'
  return 'active'
}

function inferTier(wallets, brlToUsd) {
  const totalUsd = getTotalUsdFromWallets(wallets, brlToUsd)

  if (totalUsd >= 50000) return 'Corporate'
  if (totalUsd >= 8000) return 'Premium'
  return 'Standard'
}

function mapTransactions(items) {
  return items
    .map((item) => {
      const createdAt = normalizeTimestamp(item.createdAt)
      const native = Number(item.native) || 0
      const currency = item.currency || (String(item.amount || '').includes('R$') ? 'BRL' : 'USD')

      return {
        id: item.id,
        type: item.type || (native >= 0 ? 'receive' : 'send'),
        label: item.label || 'Movimentação',
        from: item.from || item.source || item.destination || 'Sistema',
        amount: item.amount || formatAmount(native, currency),
        currency,
        native,
        time: item.time || item.createdAtLabel || formatDateLabel(createdAt),
        status: item.status || 'completed',
        createdAt,
      }
    })
    .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
}

function mapWallets(items) {
  return items.map((item, index) => ({
    id: item.id,
    symbol: item.symbol || (index === 0 ? 'BRL' : 'USD'),
    name: item.name || (item.symbol === 'USD' ? 'Dólar americano' : 'Real brasileiro'),
    native: Number(item.native) || 0,
    color: item.color || (item.symbol === 'USD' ? '#4a7fdb' : '#3ecf8e'),
    totalUsdPatrimony: item.totalUsdPatrimony,
  }))
}

/** Carteiras do Firestore para exibição no admin — preserva saldos nativos gravados. */
export function normalizeAdminWallets(items) {
  const mapped = mapWallets(items)
  const brl = mapped.find((w) => w.symbol === 'BRL') || {
    id: 'brl',
    symbol: 'BRL',
    name: 'Real brasileiro',
    native: 0,
    color: '#3ecf8e',
  }
  const usd = mapped.find((w) => w.symbol === 'USD') || {
    id: 'usd',
    symbol: 'USD',
    name: 'Dólar americano',
    native: 0,
    color: '#4a7fdb',
  }

  return [brl, usd]
}

export async function fetchClientWallets(userUid) {
  if (!hasFirebaseConfig || !db || !userUid) return []

  const walletsSnapshot = await getDocs(collection(db, 'users', userUid, 'wallets'))
  const items = walletsSnapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))

  return normalizeAdminWallets(items)
}

function mapCards(items) {
  return items
    .filter((item) => !item.deleted)
    .map((item) => ({
      id: item.id,
      brand: item.brand || 'Cartão corporativo',
      holder: item.holder || 'Titular não informado',
      number: item.number || '**** **** **** 0000',
      valid: item.valid || '--/--',
      cvv: item.cvv || '***',
      currency: item.currency || 'BRL',
      limit: item.limit || 'R$ 0,00',
      status: item.status || 'Ativo',
      createdAt: normalizeTimestamp(item.createdAt),
    }))
}

async function loadClientsFromUsers(brlToUsd) {
  const usersSnapshot = await getDocs(collection(db, 'users'))

  return Promise.all(usersSnapshot.docs.map(async (userDoc, index) => {
    const userData = userDoc.data()
    const walletsSnapshot = await getDocs(query(collection(db, 'users', userDoc.id, 'wallets'), limit(20)))
    const transactionsSnapshot = await getDocs(query(collection(db, 'users', userDoc.id, 'transactions'), limit(80)))
    const cardsSnapshot = await getDocs(query(collection(db, 'users', userDoc.id, 'cards'), limit(20)))

    const wallets = reconcileWalletBalances(
      mapWallets(walletsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
      brlToUsd,
    )
    const transactions = mapTransactions(transactionsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    const cards = mapCards(cardsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
    const joinedAt = normalizeTimestamp(userData.createdAt)

    return {
      id: userDoc.id,
      name: userData.name || userData.displayName || userData.email || `Cliente ${index + 1}`,
      email: userData.email || '',
      phone: userData.phone || userData.telefone || 'Não informado',
      joinedAt: formatDateLabel(joinedAt),
      status: userData.status || inferStatus(transactions),
      tier: userData.tier || inferTier(wallets, brlToUsd),
      avatarInitials: getInitials(userData.name || userData.displayName, userData.email),
      avatarColor: CLIENT_COLORS[index % CLIENT_COLORS.length],
      wallets,
      transactions,
      cards,
    }
  }))
}

// Fallback: deriva clientes a partir de adminRequests (sempre acessível ao admin)
async function loadClientsFromRequests(brlToUsd) {
  const requestsSnapshot = await getDocs(
    query(collection(db, 'adminRequests'), limit(500)),
  )

  const byUid = new Map()

  requestsSnapshot.docs.forEach((reqDoc, index) => {
    const req = reqDoc.data()
    if (!req.userUid) return

    if (!byUid.has(req.userUid)) {
      byUid.set(req.userUid, {
        id: req.userUid,
        name: req.userName || req.userEmail || `Cliente ${byUid.size + 1}`,
        email: req.userEmail || '',
        phone: 'Não informado',
        joinedAt: formatDateLabel(normalizeTimestamp(req.createdAt)),
        status: 'active',
        tier: 'Standard',
        avatarInitials: getInitials(req.userName, req.userEmail),
        avatarColor: CLIENT_COLORS[byUid.size % CLIENT_COLORS.length],
        wallets: [],
        transactions: [],
        cards: [],
        _index: index,
      })
    }

    const client = byUid.get(req.userUid)
    const native = req.type === 'deposit' ? (req.amount || 0) : -(req.amount || 0)
    const approved = req.status === 'approved'

    client.transactions.push({
      id: reqDoc.id,
      type: req.type === 'deposit' ? 'receive' : 'send',
      label: req.type === 'deposit'
        ? `Depósito em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`
        : `Saque em ${req.symbol === 'BRL' ? 'real' : 'dólar'}`,
      from: req.source || req.destination || 'Sistema',
      amount: formatAmount(native, req.symbol || 'BRL'),
      currency: req.symbol || 'BRL',
      native: approved ? native : 0,
      time: req.createdAtLabel || formatDateLabel(normalizeTimestamp(req.createdAt)),
      status: req.status === 'approved' ? 'completed' : req.status === 'rejected' ? 'rejected' : 'pending',
      createdAt: normalizeTimestamp(req.createdAt),
    })

    // Acumula saldo aprovado com conversão sincronizada
    if (approved) {
      const movementType = req.type === 'deposit' ? 'deposit' : 'withdraw'
      const synced = computeSyncedWalletsAfterMovement({
        wallets: client.wallets,
        symbol: req.symbol || 'BRL',
        amount: Math.abs(req.amount || 0),
        type: movementType,
        brlToUsd,
      })
      client.wallets = synced.wallets
    }
  })

  return [...byUid.values()].map((client) => ({
    ...client,
    status: inferStatus(client.transactions),
    tier: inferTier(client.wallets, brlToUsd),
    transactions: client.transactions.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    ),
  }))
}

export async function adjustClientBalance({ userUid, symbol, delta, note }) {
  if (!hasFirebaseConfig || !db) throw new Error('Firebase não configurado.')
  if (!userUid || !symbol) throw new Error('Dados insuficientes para o ajuste.')

  const numericDelta = Number(delta)
  if (!numericDelta || Number.isNaN(numericDelta)) {
    throw new Error('Informe um valor válido para o ajuste.')
  }

  const brlToUsd = await fetchBrlToUsd()
  const walletsSnapshot = await getDocs(collection(db, 'users', userUid, 'wallets'))
  const currentWallets = walletsSnapshot.docs.map((item) => ({
    id: item.id,
    symbol: item.data().symbol || (item.id === 'usd' ? 'USD' : 'BRL'),
    ...item.data(),
  }))
  const synced = computeSyncedWalletsFromDelta({
    wallets: currentWallets,
    symbol,
    delta: numericDelta,
    brlToUsd,
  })

  const txId = `admin-adj-${Date.now()}`
  const now = new Date()
  const timeLabel = now.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const brlWalletRef = doc(db, 'users', userUid, 'wallets', 'brl')
  const usdWalletRef = doc(db, 'users', userUid, 'wallets', 'usd')
  const txRef = doc(db, 'users', userUid, 'transactions', txId)
  const notifRef = doc(db, 'users', userUid, 'notifications', `notif-${txId}`)

  const sign = numericDelta >= 0 ? '+' : '-'
  const abs = Math.abs(numericDelta)
  const formatted = symbol === 'BRL'
    ? `${sign}R$${abs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    : `${sign}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const batch = writeBatch(db)

  batch.set(brlWalletRef, {
    id: 'brl',
    symbol: 'BRL',
    name: 'Real brasileiro',
    native: synced.BRL,
    color: '#3ecf8e',
    ...walletPatrimonyFields(synced.totalUsd),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  batch.set(usdWalletRef, {
    id: 'usd',
    symbol: 'USD',
    name: 'Dólar americano',
    native: synced.USD,
    color: '#4a7fdb',
    ...walletPatrimonyFields(synced.totalUsd),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  batch.set(txRef, {
    id: txId,
    type: numericDelta >= 0 ? 'receive' : 'send',
    label: numericDelta >= 0 ? `Crédito manual em ${symbol}` : `Débito manual em ${symbol}`,
    from: note ? `Admin — ${note}` : 'Ajuste administrativo',
    amount: formatted,
    currency: symbol,
    native: numericDelta,
    time: timeLabel,
    status: 'completed',
    createdAt: serverTimestamp(),
  })

  batch.set(notifRef, {
    type: numericDelta >= 0 ? 'approval' : 'rejection',
    subject: numericDelta >= 0 ? `Crédito de ${formatted} aplicado` : `Débito de ${formatted} aplicado`,
    body: note
      ? `O administrador realizou um ajuste manual de <strong>${formatted}</strong> em sua conta. Motivo: ${note}.`
      : `O administrador realizou um ajuste manual de <strong>${formatted}</strong> em sua conta.`,
    from: 'siteocn@gmail.com',
    read: false,
    createdAt: serverTimestamp(),
    sentAt: timeLabel,
  })

  try {
    await batch.commit()
  } catch (error) {
    const code = String(error?.code || '')
    if (code.includes('permission-denied')) {
      throw new Error('Sem permissão no Firestore. Confirme login admin e publique as regras atualizadas.')
    }
    throw new Error(error?.message || 'Não foi possível aplicar o ajuste agora.')
  }

  return { txId, formatted, timeLabel, syncedWallets: synced.wallets }
}

export async function saveClientCard({ userUid, card }) {
  if (!hasFirebaseConfig || !db) throw new Error('Firebase não configurado.')
  if (!userUid || !card) throw new Error('Dados insuficientes para salvar o cartão.')

  const cardId = card.id || `card-${Date.now()}`
  const cardRef = doc(db, 'users', userUid, 'cards', cardId)

  await setDoc(cardRef, {
    ...card,
    id: cardId,
    deleted: false,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true })

  return { id: cardId }
}

export async function updateClientAccountStatus({ userUid, status, reason }) {
  if (!hasFirebaseConfig || !db) throw new Error('Firebase não configurado.')
  if (!userUid || !['active', 'suspended'].includes(status)) {
    throw new Error('Dados insuficientes para revisar a conta.')
  }

  const now = new Date()
  const timeLabel = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const finalReason = String(reason || '').trim() || null
  const userRef = doc(db, 'users', userUid)
  const notificationRef = doc(collection(db, 'users', userUid, 'notifications'))

  await setDoc(userRef, {
    status,
    rejectionReason: status === 'suspended' ? finalReason : null,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true })

  await setDoc(notificationRef, {
    type: status === 'active' ? 'approval' : 'rejection',
    subject: status === 'active' ? 'Sua conta foi aprovada' : 'Sua conta foi recusada',
    body: status === 'active'
      ? 'O administrador liberou seu acesso ao Ocean Capital. Voce ja pode usar o painel normalmente.'
      : finalReason
        ? `O administrador recusou o cadastro da sua conta.\n\nMotivo: ${finalReason}`
        : 'O administrador recusou o cadastro da sua conta.',
    from: 'siteocn@gmail.com',
    read: false,
    createdAt: serverTimestamp(),
    sentAt: timeLabel,
  })

  return { status, timeLabel }
}

export async function loadAdminClients() {
  if (!hasFirebaseConfig || !db) {
    return { clients: [], status: 'missing-config' }
  }

  const brlToUsd = await fetchBrlToUsd()

  // Tenta leitura completa da coleção users (requer regras permissivas)
  try {
    const clients = await loadClientsFromUsers(brlToUsd)
    return { clients, status: 'ready' }
  } catch (primaryError) {
    const code = String(primaryError?.code || '')
    if (!code.includes('permission-denied') && !code.includes('PERMISSION_DENIED')) {
      return { clients: [], status: 'error', error: primaryError }
    }
  }

  // Fallback: lê adminRequests (admin sempre tem acesso) e deriva os clientes
  try {
    const clients = await loadClientsFromRequests(brlToUsd)
    return { clients, status: 'ready' }
  } catch (fallbackError) {
    return { clients: [], status: 'error', error: fallbackError }
  }
}
