export function getAppUrl() {
  const fromEnv = String(import.meta.env.VITE_APP_URL || '').trim().replace(/\/$/, '')
  if (fromEnv) return fromEnv

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }

  return 'https://ocn.capital'
}
