import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db, hasFirebaseConfig } from './firebase.js'
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

export async function loadWorkspaceData(uid) {
  const [wallets, transactions, cards, bankAccounts, exchangeRates, securityEvents, settings] = await Promise.all([
    readCollection(uid, 'wallets'),
    readCollection(uid, 'transactions'),
    readCollection(uid, 'cards'),
    readCollection(uid, 'bankAccounts'),
    readCollection(uid, 'exchangeRates'),
    readCollection(uid, 'securityEvents'),
    readCollection(uid, 'settings'),
  ])

  return {
    wallets,
    transactions,
    cards,
    bankAccounts,
    exchangeRates,
    securityEvents,
    settings,
  }
}
