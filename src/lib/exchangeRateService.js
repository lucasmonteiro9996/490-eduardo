const CACHE_TTL_MS = 10 * 60 * 1000
const FALLBACK_RATE = 1 / 5.75 // ~0.174

let _cache = { rate: FALLBACK_RATE, at: 0 }

export async function fetchBrlToUsd() {
  if (Date.now() - _cache.at < CACHE_TTL_MS) return _cache.rate

  try {
    const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
    const json = await res.json()
    const bid = parseFloat(json.USDBRL?.bid)
    if (bid > 0) {
      _cache = { rate: 1 / bid, at: Date.now() }
    }
  } catch {
    // mantém cache anterior ou fallback
  }

  return _cache.rate
}

export function getCachedBrlToUsd() {
  return _cache.rate
}
