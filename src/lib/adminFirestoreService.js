import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db, hasFirebaseConfig } from './firebase.js'

const CLIENT_COLORS = ['#4a7fdb', '#3ecf8e', '#a78bfa', '#f5c842', '#34d8b6', '#f97316']
const BRL_TO_USD = 0.2

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

function inferTier(wallets) {
  const totalUsd = wallets.reduce((sum, wallet) => {
    if (wallet.symbol === 'USD') return sum + (Number(wallet.native) || 0)
    return sum + (Number(wallet.native) || 0) * BRL_TO_USD
  }, 0)

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
    symbol: item.symbol || (index === 0 ? 'BRL' : 'USD'),
    name: item.name || (item.symbol === 'USD' ? 'Dólar americano' : 'Real brasileiro'),
    native: Number(item.native) || 0,
    color: item.color || (item.symbol === 'USD' ? '#4a7fdb' : '#3ecf8e'),
  }))
}

export async function loadAdminClients() {
  if (!hasFirebaseConfig || !db) {
    return { clients: [], status: 'missing-config' }
  }

  try {
    const usersSnapshot = await getDocs(collection(db, 'users'))

    const clients = await Promise.all(usersSnapshot.docs.map(async (userDoc, index) => {
      const userData = userDoc.data()
      const walletsSnapshot = await getDocs(query(collection(db, 'users', userDoc.id, 'wallets'), limit(20)))
      const transactionsSnapshot = await getDocs(query(collection(db, 'users', userDoc.id, 'transactions'), limit(80)))

      const wallets = mapWallets(walletsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      const transactions = mapTransactions(transactionsSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      const joinedAt = normalizeTimestamp(userData.createdAt)

      return {
        id: userDoc.id,
        name: userData.name || userData.displayName || userData.email || `Cliente ${index + 1}`,
        email: userData.email || '',
        phone: userData.phone || userData.telefone || 'Não informado',
        joinedAt: formatDateLabel(joinedAt),
        status: userData.status || inferStatus(transactions),
        tier: userData.tier || inferTier(wallets),
        avatarInitials: getInitials(userData.name || userData.displayName, userData.email),
        avatarColor: CLIENT_COLORS[index % CLIENT_COLORS.length],
        wallets,
        transactions,
      }
    }))

    return {
      clients,
      status: 'ready',
    }
  } catch (error) {
    const code = String(error?.code || '')

    return {
      clients: [],
      status: code.includes('permission-denied') ? 'permission-denied' : 'error',
      error,
    }
  }
}
