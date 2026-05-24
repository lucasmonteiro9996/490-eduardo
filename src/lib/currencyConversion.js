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

function getTotalUsdFromWalletNatives(wallets, brlToUsd) {
  const rate = resolveRate(brlToUsd)
  const brlWallet = wallets.find((w) => w.symbol === 'BRL')
  const usdWallet = wallets.find((w) => w.symbol === 'USD')

  const brlAsUsd = (Number(brlWallet?.native) || 0) * rate
  const usdVal = Number(usdWallet?.native) || 0

  if (brlAsUsd <= 0 && usdVal <= 0) return 0
  if (brlAsUsd <= 0) return roundMoney(usdVal)
  if (usdVal <= 0) return roundMoney(brlAsUsd)

  return roundMoney(Math.min(usdVal, brlAsUsd))
}

/** Patrimônio total em USD — usa campo persistido ou o menor equivalente (evita carteira desatualizada anular débito). */
export function getTotalUsdFromWallets(wallets, brlToUsd) {
  const brlWallet = wallets.find((w) => w.symbol === 'BRL')
  const usdWallet = wallets.find((w) => w.symbol === 'USD')

  const stored = brlWallet?.totalUsdPatrimony ?? usdWallet?.totalUsdPatrimony
  if (stored != null && !Number.isNaN(Number(stored))) {
    const storedTotal = roundMoney(Number(stored))
    // totalUsdPatrimony zerado no Firestore não pode anular saldos nativos reais
    if (storedTotal !== 0) return storedTotal
  }

  return getTotalUsdFromWalletNatives(wallets, brlToUsd)
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
  const brlWallet = wallets.find((w) => w.symbol === 'BRL')
  const usdWallet = wallets.find((w) => w.symbol === 'USD')

  // Mantém valores gravados no Firestore (evita reconverter e perder centavos na tela).
  if (brlWallet?.totalUsdPatrimony != null && brlWallet?.native != null && usdWallet?.native != null) {
    const totalUsd = roundMoney(Number(brlWallet.totalUsdPatrimony))
    if (totalUsd !== 0) {
      return [
        { ...brlWallet, native: roundMoney(brlWallet.native), ...walletPatrimonyFields(totalUsd) },
        { ...usdWallet, native: roundMoney(usdWallet.native), ...walletPatrimonyFields(totalUsd) },
      ]
    }
  }

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
  const usdToBrl = getUsdToBrl(rate)
  const sign = type === 'deposit' ? 1 : -1
  const movement = roundMoney(Math.abs(Number(amount) || 0) * sign)

  const brlWallet = wallets.find((w) => w.symbol === 'BRL') || { symbol: 'BRL', id: 'brl' }
  const usdWallet = wallets.find((w) => w.symbol === 'USD') || { symbol: 'USD', id: 'usd' }

  let brlNative = roundMoney(Number(brlWallet.native) || 0)
  let usdNative = roundMoney(Number(usdWallet.native) || 0)

  // Aplica o valor exato na moeda do movimento; evita perda de centavos na ida/volta BRL→USD→BRL.
  if (symbol === 'BRL') {
    brlNative = roundMoney(brlNative + movement)
    const totalUsd = roundMoney(brlNative * rate)
    usdNative = totalUsd
  } else {
    usdNative = roundMoney(usdNative + movement)
    const totalUsd = roundMoney(usdNative)
    brlNative = roundMoney(totalUsd * usdToBrl)
  }

  const totalUsd = symbol === 'BRL' ? roundMoney(brlNative * rate) : roundMoney(usdNative)

  return {
    totalUsd,
    wallets: [
      { ...brlWallet, symbol: 'BRL', native: brlNative, ...walletPatrimonyFields(totalUsd) },
      { ...usdWallet, symbol: 'USD', native: usdNative, ...walletPatrimonyFields(totalUsd) },
    ],
    BRL: brlNative,
    USD: usdNative,
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
