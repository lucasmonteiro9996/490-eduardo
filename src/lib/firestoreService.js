import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db, hasFirebaseConfig } from './firebase.js'
import { reconcileWalletBalances } from './currencyConversion.js'
import { fetchBrlToUsd } from './exchangeRateService.js'
import {
  mockCards,
  mockRates,
  mockSecurityEvents,
  mockSettings,
  mockTransactions,
  mockWallets,
} from './mockData.js'

const FALLBACK_DATA = {
  wallets: mockWallets,
  transactions: mockTransactions,
  cards: mockCards,
  bankAccounts: [],
  exchangeRates: mockRates,
  securityEvents: mockSecurityEvents,
  settings: mockSettings,
  investments: [],
}

function normalizeDocs(snapshot) {
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }))
}

async function readCollection(uid, collectionName, size = 12) {
  if (!hasFirebaseConfig || !db || !uid) {
    return {
      data: FALLBACK_DATA[collectionName] ?? [],
      source: 'mock',
      status: hasFirebaseConfig ? 'missing-user' : 'missing-config',
    }
  }

  try {
    const ref = collection(db, 'users', uid, collectionName)
    const snapshot = await getDocs(query(ref, limit(size)))

    return {
      data: normalizeDocs(snapshot),
      source: 'firebase',
      status: snapshot.empty ? 'empty' : 'ready',
    }
  } catch (error) {
    const permissionDenied = error?.code === 'permission-denied' || error?.code === 'firestore/permission-denied'

    return {
      data: [],
      source: 'firebase',
      status: permissionDenied ? 'permission-denied' : 'error',
      error,
    }
  }
}

const DEFAULT_WALLETS = [
  { id: 'brl', symbol: 'BRL', name: 'Real brasileiro', native: 0, change: '+0,0%', up: true, color: '#3ecf8e' },
  { id: 'usd', symbol: 'USD', name: 'Dólar americano', native: 0, change: '+0,0%', up: true, color: '#4a7fdb' },
]

export async function fetchUserWallets(uid, brlToUsd) {
  if (!hasFirebaseConfig || !db || !uid) {
    return DEFAULT_WALLETS
  }

  try {
    const snapshot = await getDocs(collection(db, 'users', uid, 'wallets'))
    const docs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    const rate = brlToUsd > 0 ? brlToUsd : await fetchBrlToUsd()
    const brlDoc = docs.find((item) => item.symbol === 'BRL' || item.id === 'brl')
    const usdDoc = docs.find((item) => item.symbol === 'USD' || item.id === 'usd')

    return reconcileWalletBalances(
      [
        { ...DEFAULT_WALLETS[0], ...brlDoc, symbol: 'BRL' },
        { ...DEFAULT_WALLETS[1], ...usdDoc, symbol: 'USD' },
      ],
      rate,
    )
  } catch {
    return DEFAULT_WALLETS
  }
}

export async function loadWorkspaceData(uid) {
  const [wallets, transactions, cards, bankAccounts, exchangeRates, securityEvents, settings, investments] = await Promise.all([
    readCollection(uid, 'wallets'),
    readCollection(uid, 'transactions', 100),
    readCollection(uid, 'cards'),
    readCollection(uid, 'bankAccounts'),
    readCollection(uid, 'exchangeRates'),
    readCollection(uid, 'securityEvents'),
    readCollection(uid, 'settings'),
    readCollection(uid, 'investments', 50),
  ])

  return {
    wallets,
    transactions,
    cards,
    bankAccounts,
    exchangeRates,
    securityEvents,
    settings,
    investments,
  }
}
