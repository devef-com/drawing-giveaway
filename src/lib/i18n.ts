import { createIsomorphicFn } from '@tanstack/react-start'
import { getCookie, getRequest, setCookie } from '@tanstack/react-start/server'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import enTranslations from '../locales/en.json'
import esTranslations from '../locales/es.json'

export const resources = {
  en: {
    translation: enTranslations,
  },
  es: {
    translation: esTranslations,
  },
} as const

export const defaultNS = 'translation'

const i18nCookieName = 'i18nextLngGiway'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es'],
    detection: {
      order: ['cookie'],
      lookupCookie: i18nCookieName,
      caches: ['cookie'],
      cookieMinutes: 60 * 24 * 365,
    },
    interpolation: { escapeValue: false },
  })

const supportedLngs = ['en', 'es'] as const
type SupportedLng = (typeof supportedLngs)[number]

function pickSupportedLanguage(
  acceptLanguageHeader: string | null,
): SupportedLng | null {
  if (!acceptLanguageHeader) return null

  // Example: "es-ES,es;q=0.9,en;q=0.8"
  const parts = acceptLanguageHeader
    .split(',')
    .map((p) => p.trim().split(';')[0])
    .filter(Boolean)

  for (const tag of parts) {
    const base = tag.toLowerCase().split('-')[0] as SupportedLng
    if ((supportedLngs as readonly string[]).includes(base)) return base
  }

  return null
}

export const setSSRLanguage = createIsomorphicFn().server(async () => {
  const req = getRequest()

  const cookieLng = getCookie(i18nCookieName) as string | undefined
  const headerLng = pickSupportedLanguage(req.headers.get('accept-language'))

  const language = (cookieLng || headerLng || 'en') as SupportedLng

  if (!cookieLng || cookieLng !== language) {
    setCookie(i18nCookieName, language, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production',
    })
  }

  await i18n.changeLanguage(language)
})

export default i18n
