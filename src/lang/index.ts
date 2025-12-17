import enMessages from './en.json'
import esMessages from './es.json'

export type Locale = 'en' | 'es'

export const locales: readonly Locale[] = ['en', 'es'] as const
export const baseLocale: Locale = 'en'

const messages: Record<Locale, Record<string, string>> = {
  en: enMessages,
  es: esMessages,
}

let currentLocale: Locale = baseLocale

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale): void {
  if (locales.includes(locale)) {
    currentLocale = locale
  }
}

function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) => params[key] || `{${key}}`)
}

function t(key: string, params?: Record<string, string>): string {
  const message = messages[currentLocale][key] || messages[baseLocale][key] || key
  return interpolate(message, params)
}

// Export individual message functions for better TypeScript support
export const m = {
  app_title: () => t('app.title'),
  app_description: () => t('app.description'),
  nav_home: () => t('nav.home'),
  nav_drawings: () => t('nav.drawings'),
  nav_store: () => t('nav.store'),
  nav_account: () => t('nav.account'),
  theme_label: () => t('theme.label'),
  landing_badge: () => t('landing.badge'),
  landing_title: (params: { giway: string }) => t('landing.title', params),
  landing_subtitle: () => t('landing.subtitle'),
  landing_cta_getStarted: () => t('landing.cta.getStarted'),
  landing_cta_login: () => t('landing.cta.login'),
  landing_preview_available: () => t('landing.preview.available'),
  landing_preview_showing: (params: { start: string; end: string }) =>
    t('landing.preview.showing', params),
  landing_preview_previous: () => t('landing.preview.previous'),
  landing_preview_next: () => t('landing.preview.next'),
  landing_preview_goToPage: (params: { page: string }) =>
    t('landing.preview.goToPage', params),
  landing_eventTypes_title: () => t('landing.eventTypes.title'),
  landing_eventTypes_subtitle: () => t('landing.eventTypes.subtitle'),
  landing_eventTypes_raffles_title: () => t('landing.eventTypes.raffles.title'),
  landing_eventTypes_raffles_description: () =>
    t('landing.eventTypes.raffles.description'),
  landing_eventTypes_raffles_feature1: () =>
    t('landing.eventTypes.raffles.feature1'),
  landing_eventTypes_raffles_feature2: () =>
    t('landing.eventTypes.raffles.feature2'),
  landing_eventTypes_raffles_feature3: () =>
    t('landing.eventTypes.raffles.feature3'),
  landing_eventTypes_raffles_feature4: () =>
    t('landing.eventTypes.raffles.feature4'),
  landing_eventTypes_giveaway_title: () => t('landing.eventTypes.giveaway.title'),
  landing_eventTypes_giveaway_description: () =>
    t('landing.eventTypes.giveaway.description'),
  landing_eventTypes_giveaway_feature1: () =>
    t('landing.eventTypes.giveaway.feature1'),
  landing_eventTypes_giveaway_feature2: () =>
    t('landing.eventTypes.giveaway.feature2'),
  landing_eventTypes_giveaway_feature3: () =>
    t('landing.eventTypes.giveaway.feature3'),
  landing_eventTypes_giveaway_feature4: () =>
    t('landing.eventTypes.giveaway.feature4'),
  landing_howItWorks_title: () => t('landing.howItWorks.title'),
  landing_howItWorks_step1_title: () => t('landing.howItWorks.step1.title'),
  landing_howItWorks_step1_description: () =>
    t('landing.howItWorks.step1.description'),
  landing_howItWorks_step2_title: () => t('landing.howItWorks.step2.title'),
  landing_howItWorks_step2_description: () =>
    t('landing.howItWorks.step2.description'),
  landing_howItWorks_step3_title: () => t('landing.howItWorks.step3.title'),
  landing_howItWorks_step3_description: () =>
    t('landing.howItWorks.step3.description'),
  landing_features_title: () => t('landing.features.title'),
  landing_features_subtitle: () => t('landing.features.subtitle'),
  landing_features_numberSlots_title: () =>
    t('landing.features.numberSlots.title'),
  landing_features_numberSlots_description: () =>
    t('landing.features.numberSlots.description'),
  landing_features_participantHistory_title: () =>
    t('landing.features.participantHistory.title'),
  landing_features_participantHistory_description: () =>
    t('landing.features.participantHistory.description'),
  landing_features_winnerSelection_title: () =>
    t('landing.features.winnerSelection.title'),
  landing_features_winnerSelection_description: () =>
    t('landing.features.winnerSelection.description'),
  landing_features_imageUploads_title: () =>
    t('landing.features.imageUploads.title'),
  landing_features_imageUploads_description: () =>
    t('landing.features.imageUploads.description'),
  landing_features_emailNotifications_title: () =>
    t('landing.features.emailNotifications.title'),
  landing_features_emailNotifications_description: () =>
    t('landing.features.emailNotifications.description'),
  landing_features_watchAds_title: () => t('landing.features.watchAds.title'),
  landing_features_watchAds_description: () =>
    t('landing.features.watchAds.description'),
  landing_pricing_title: () => t('landing.pricing.title'),
  landing_pricing_subtitle: () => t('landing.pricing.subtitle'),
  landing_pricing_monthlyFree_title: () => t('landing.pricing.monthlyFree.title'),
  landing_pricing_monthlyFree_description: () =>
    t('landing.pricing.monthlyFree.description'),
  landing_pricing_monthlyFree_feature1: () =>
    t('landing.pricing.monthlyFree.feature1'),
  landing_pricing_monthlyFree_feature2: () =>
    t('landing.pricing.monthlyFree.feature2'),
  landing_pricing_monthlyFree_feature3: () =>
    t('landing.pricing.monthlyFree.feature3'),
  landing_pricing_monthlyFree_note: () => t('landing.pricing.monthlyFree.note'),
  landing_pricing_purchasePacks_title: () =>
    t('landing.pricing.purchasePacks.title'),
  landing_pricing_purchasePacks_description: () =>
    t('landing.pricing.purchasePacks.description'),
  landing_pricing_purchasePacks_feature1: () =>
    t('landing.pricing.purchasePacks.feature1'),
  landing_pricing_purchasePacks_feature2: () =>
    t('landing.pricing.purchasePacks.feature2'),
  landing_pricing_purchasePacks_feature3: () =>
    t('landing.pricing.purchasePacks.feature3'),
  landing_pricing_purchasePacks_feature4: () =>
    t('landing.pricing.purchasePacks.feature4'),
  landing_pricing_watchAds_title: () => t('landing.pricing.watchAds.title'),
  landing_pricing_watchAds_description: () =>
    t('landing.pricing.watchAds.description'),
  landing_pricing_watchAds_feature1: () => t('landing.pricing.watchAds.feature1'),
  landing_pricing_watchAds_feature2: () => t('landing.pricing.watchAds.feature2'),
  landing_pricing_watchAds_feature3: () => t('landing.pricing.watchAds.feature3'),
  landing_pricing_watchAds_note: () => t('landing.pricing.watchAds.note'),
  landing_cta_title: () => t('landing.cta.title'),
  landing_cta_subtitle: () => t('landing.cta.subtitle'),
  landing_cta_button: () => t('landing.cta.button'),
  language_switcher_label: () => t('language.switcher.label'),
}
