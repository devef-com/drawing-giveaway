import { createContext, useContext, useState } from 'react'
import {
  type Locale,
  locales,
  baseLocale,
  getLocale,
  setLocale as setI18nLocale,
} from '../lang'

interface LanguageContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  availableLocales: readonly Locale[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
)

function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return baseLocale

  // Check localStorage first
  const stored = localStorage.getItem('PARAGLIDE_LOCALE')
  if (stored && locales.includes(stored as Locale)) {
    return stored as Locale
  }

  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  if (locales.includes(browserLang as Locale)) {
    return browserLang as Locale
  }

  return baseLocale
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const detected = detectBrowserLanguage()
    // Initialize the i18n locale
    setI18nLocale(detected)
    return detected
  })

  const setLocale = (newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale)
      localStorage.setItem('PARAGLIDE_LOCALE', newLocale)
      // Update i18n locale
      setI18nLocale(newLocale)
    }
  }

  return (
    <LanguageContext.Provider
      value={{ locale, setLocale, availableLocales: locales }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
