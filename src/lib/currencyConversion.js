import { fetchBrlToUsd, getCachedBrlToUsd } from './exchangeRateService.js'

export function getUsdToBrl(brlToUsd = getCachedBrlToUsd()) {
  return brlToUsd > 0 ? 1 / brlToUsd : 5.75
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100
}

function resolveRate(brlToUsd) {
  return brlToUsd > 0 ? brlToUsd : getCachedBrlToUsd()
}

/** Patrimônio total em USD — usa campo persistido ou o menor equivalente (evita carteira desatualizada anular débito). */
export function getTotalUsdFromWallets(wallets, brlToUsd) {
  const rate = resolveRate(brlToUsd)
  const brlWallet = wallets.find((w) => w.symbol === 'BRL')
  const usdWallet = wallets.find((w) => w.symbol === 'USD')

  const stored = brlWallet?.totalUsdPatrimony ?? usdWallet?.totalUsdPatrimony
  if (stored != null && !Number.isNaN(Number(stored))) {
    return roundMoney(Number(stored))
  }

  const brlAsUsd = (Number(brlWallet?.native) || 0) * rate
  const usdVal = Number(usdWallet?.native) || 0

  if (brlAsUsd <= 0 && usdVal <= 0) return 0
  if (brlAsUsd <= 0) return roundMoney(usdVal)
  if (usdVal <= 0) return roundMoney(brlAsUsd)

  return roundMoney(Math.min(usdVal, brlAsUsd))
}

export function walletPatrimonyFields(totalUsd) {
  const safeTotal = roundMoney(totalUsd)
  return { totalUsdPatrimony: safeTotal }
}

/** Divide o patrimônio total em saldos BRL e USD equivalentes. */
export function splitTotalUsdToWallets(totalUsd, brlToUsd) {
  const rate = resolveRate(brlToUsd)
  const usdToBrl = getUsdToBrl(rate)
  const safeTotal = roundMoney(totalUsd)

  return {
    BRL: roundMoney(safeTotal * usdToBrl),
    USD: safeTotal,
    brlToUsd: rate,
    usdToBrl,
  }
}

/** Sincroniza carteiras para exibir o mesmo patrimônio nas duas moedas. */
export function reconcileWalletBalances(wallets, brlToUsd) {
  const totalUsd = getTotalUsdFromWallets(wallets, brlToUsd)
  return walletsFromTotalUsd(totalUsd, brlToUsd, wallets)
}

export function walletsFromTotalUsd(totalUsd, brlToUsd, existingWallets = []) {
  const { BRL, USD } = splitTotalUsdToWallets(totalUsd, brlToUsd)
  const brlWallet = existingWallets.find((w) => w.symbol === 'BRL') || { symbol: 'BRL', id: 'brl' }
  const usdWallet = existingWallets.find((w) => w.symbol === 'USD') || { symbol: 'USD', id: 'usd' }

  return [
    { ...brlWallet, symbol: 'BRL', native: BRL },
    { ...usdWallet, symbol: 'USD', native: USD },
  ]
}

/** Aplica depósito/saque ao patrimônio total em USD. */
export function applyMovementToTotalUsd(totalUsd, { symbol, amount, type, brlToUsd }) {
  const rate = resolveRate(brlToUsd)
  const sign = type === 'deposit' ? 1 : -1 // saque e investimento debitam o patrimônio
  const absAmount = Math.abs(Number(amount) || 0)
  const deltaUsd = symbol === 'USD' ? absAmount * sign : absAmount * sign * rate
  return roundMoney((Number(totalUsd) || 0) + deltaUsd)
}

/** Calcula novos saldos absolutos sincronizados após um movimento. */
export function computeSyncedWalletsAfterMovement({ wallets, symbol, amount, type, brlToUsd }) {
  const rate = resolveRate(brlToUsd)
  const currentTotalUsd = getTotalUsdFromWallets(wallets, rate)
  const newTotalUsd = applyMovementToTotalUsd(currentTotalUsd, { symbol, amount, type, brlToUsd: rate })
  const syncedWallets = walletsFromTotalUsd(newTotalUsd, rate, wallets)
  const split = splitTotalUsdToWallets(newTotalUsd, rate)

  return {
    totalUsd: newTotalUsd,
    wallets: syncedWallets.map((wallet) => ({
      ...wallet,
      ...walletPatrimonyFields(newTotalUsd),
    })),
    BRL: split.BRL,
    USD: split.USD,
    brlToUsd: rate,
  }
}

/** Ajuste manual com delta já assinado (+ crédito, - débito). */
export function computeSyncedWalletsFromDelta({ wallets, symbol, delta, brlToUsd }) {
  const movementType = Number(delta) >= 0 ? 'deposit' : 'withdraw'
  return computeSyncedWalletsAfterMovement({
    wallets,
    symbol,
    amount: Math.abs(Number(delta) || 0),
    type: movementType,
    brlToUsd,
  })
}

export async function resolveBrlToUsdRate() {
  return fetchBrlToUsd()
}

/** Converte entrada do admin (ex: 1.234,56 ou 1234.56) para número. */
export function parseMoneyInput(value) {
  const raw = String(value || '').trim()
  if (!raw) return NaN

  if (raw.includes(',')) {
    return Number(raw.replace(/\./g, '').replace(',', '.'))
  }

  return Number(raw.replace(/,/g, ''))
}
