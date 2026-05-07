import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { TRANSLATIONS } from '../i18n/translations.js'

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('oc_lang') || 'pt')
  const [preferredCurrency, setPreferredCurrency] = useState(() => localStorage.getItem('oc_currency') || 'BRL')

  const changeLanguage = useCallback((lang) => {
    setLanguage(lang)
    localStorage.setItem('oc_lang', lang)
  }, [])

  const changeCurrency = useCallback((currency) => {
    setPreferredCurrency(currency)
    localStorage.setItem('oc_currency', currency)
  }, [])

  const value = useMemo(() => ({
    language,
    preferredCurrency,
    changeLanguage,
    changeCurrency,
    t: (key) => TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.pt[key] ?? key,
  }), [language, preferredCurrency, changeLanguage, changeCurrency])

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  )
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext)
  if (!ctx) throw new Error('usePreferences must be inside PreferencesProvider')
  return ctx
}
