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
  common_support: () => t('common.support'),
  common_free: () => t('common.free'),
  common_cancel: () => t('common.cancel'),
  common_save: () => t('common.save'),
  common_edit: () => t('common.edit'),
  common_delete: () => t('common.delete'),
  common_close: () => t('common.close'),
  common_loading: () => t('common.loading'),
  common_error: () => t('common.error'),
  common_success: () => t('common.success'),
  common_email: () => t('common.email'),
  common_password: () => t('common.password'),
  common_name: () => t('common.name'),
  common_or: () => t('common.or'),
  drawing_stats_progress: () => t('drawing.stats.progress'),
  drawing_stats_available: () => t('drawing.stats.available'),
  drawing_stats_taken: () => t('drawing.stats.taken'),
  drawing_stats_reserved: () => t('drawing.stats.reserved'),
  drawing_stats_totalNumbers: () => t('drawing.stats.totalNumbers'),
  drawing_header_less: () => t('drawing.header.less'),
  drawing_header_more: () => t('drawing.header.more'),
  drawing_header_free: () => t('drawing.header.free'),
  drawing_header_available: () => t('drawing.header.available'),
  number_grid_scrollMore: () => t('number.grid.scrollMore'),
  number_grid_allLoaded: (params: { total: string }) =>
    t('number.grid.allLoaded', params),
  participant_comments_title: () => t('participant.comments.title'),
  participant_comments_placeholder: () => t('participant.comments.placeholder'),
  participant_comments_visibleToParticipant: () =>
    t('participant.comments.visibleToParticipant'),
  participant_comments_sendMessage: () => t('participant.comments.sendMessage'),
  participant_comments_sending: () => t('participant.comments.sending'),
  participant_comments_noMessages: () => t('participant.comments.noMessages'),
  participant_comments_participant: () => t('participant.comments.participant'),
  participant_comments_private: () => t('participant.comments.private'),
  participant_comments_success: () => t('participant.comments.success'),
  participant_comments_error: () => t('participant.comments.error'),
  participant_commentsView_title: () => t('participant.commentsView.title'),
  participant_commentsView_loading: () => t('participant.commentsView.loading'),
  participant_commentsView_noMessages: () =>
    t('participant.commentsView.noMessages'),
  participant_commentsView_host: () => t('participant.commentsView.host'),
  participant_commentsView_you: () => t('participant.commentsView.you'),
  participant_commentsView_placeholder: () =>
    t('participant.commentsView.placeholder'),
  participant_commentsView_sendSuccess: () =>
    t('participant.commentsView.sendSuccess'),
  participant_commentsView_sendError: () => t('participant.commentsView.sendError'),
  image_upload_label: (params: { count: string; max: string }) =>
    t('image.upload.label', params),
  image_upload_uploadAll: () => t('image.upload.uploadAll'),
  image_upload_clickToEdit: () => t('image.upload.clickToEdit'),
  image_upload_setCover: () => t('image.upload.setCover'),
  image_upload_edited: () => t('image.upload.edited'),
  image_upload_cover: () => t('image.upload.cover'),
  image_upload_compressing: () => t('image.upload.compressing'),
  image_upload_clickOrDrag: () => t('image.upload.clickOrDrag'),
  image_upload_allowedTypes: (params: { max: string }) =>
    t('image.upload.allowedTypes', params),
  image_upload_maxImagesError: (params: { max: string }) =>
    t('image.upload.maxImagesError', params),
  image_upload_invalidFileType: (params: { name: string }) =>
    t('image.upload.invalidFileType', params),
  image_upload_processingError: (params: { name: string }) =>
    t('image.upload.processingError', params),
  image_upload_setCoverError: () => t('image.upload.setCoverError'),
  image_upload_uploadError: (params: { count: string }) =>
    t('image.upload.uploadError', params),
  image_crop_title: () => t('image.crop.title'),
  image_crop_description: () => t('image.crop.description'),
  image_crop_freeCrop: () => t('image.crop.freeCrop'),
  image_crop_coverCrop: () => t('image.crop.coverCrop'),
  image_crop_coverInfo: () => t('image.crop.coverInfo'),
  image_crop_zoom: () => t('image.crop.zoom'),
  image_crop_rotate: () => t('image.crop.rotate'),
  image_crop_processing: () => t('image.crop.processing'),
  image_crop_setAsCover: () => t('image.crop.setAsCover'),
  image_crop_apply: () => t('image.crop.apply'),
  image_crop_coverSuccess: () => t('image.crop.coverSuccess'),
  image_crop_editSuccess: () => t('image.crop.editSuccess'),
  store_title: () => t('store.title'),
  store_subtitle: () => t('store.subtitle'),
  store_createGiway: () => t('store.createGiway'),
  store_currentBalance: () => t('store.currentBalance'),
  store_raffleBalance: () => t('store.raffleBalance'),
  store_giveawayBalance: () => t('store.giveawayBalance'),
  store_participants: () => t('store.participants'),
  store_images: () => t('store.images'),
  store_emails: () => t('store.emails'),
  store_loadingPacks: () => t('store.loadingPacks'),
  store_noPacks: () => t('store.noPacks'),
  store_rafflePacks: () => t('store.rafflePacks'),
  store_giveawayPacks: () => t('store.giveawayPacks'),
  store_raffleDescription: () => t('store.raffleDescription'),
  store_giveawayDescription: () => t('store.giveawayDescription'),
  store_buyPack: () => t('store.buyPack'),
  store_packPurchased: () => t('store.packPurchased'),
  store_loginRequired: (params: { login: string }) =>
    t('store.loginRequired', params),
  store_loginLink: () => t('store.loginLink'),
  store_monthlyFree_title: () => t('store.monthlyFree.title'),
  store_monthlyFree_description: () => t('store.monthlyFree.description'),
  store_monthlyFree_participants: () => t('store.monthlyFree.participants'),
  store_monthlyFree_images: () => t('store.monthlyFree.images'),
  store_monthlyFree_note: () => t('store.monthlyFree.note'),
  support_title: () => t('support.title'),
  support_subtitle: () => t('support.subtitle'),
  support_faq_title: () => t('support.faq.title'),
  support_faq_whatIsGiway_q: () => t('support.faq.whatIsGiway.q'),
  support_faq_whatIsGiway_a: () => t('support.faq.whatIsGiway.a'),
  support_faq_freeVsPaid_q: () => t('support.faq.freeVsPaid.q'),
  support_faq_freeVsPaid_a: () => t('support.faq.freeVsPaid.a'),
  support_faq_playWithNumbers_q: () => t('support.faq.playWithNumbers.q'),
  support_faq_playWithNumbers_a: () => t('support.faq.playWithNumbers.a'),
  support_faq_moreParticipants_q: () => t('support.faq.moreParticipants.q'),
  support_faq_moreParticipants_a: () => t('support.faq.moreParticipants.a'),
  support_faq_rejectParticipant_q: () => t('support.faq.rejectParticipant.q'),
  support_faq_rejectParticipant_a: () => t('support.faq.rejectParticipant.a'),
  support_faq_packsExpire_q: () => t('support.faq.packsExpire.q'),
  support_faq_packsExpire_a: () => t('support.faq.packsExpire.a'),
  support_contact_title: () => t('support.contact.title'),
  support_contact_subtitle: () => t('support.contact.subtitle'),
  support_contact_button: () => t('support.contact.button'),
  auth_login_title: () => t('auth.login.title'),
  auth_login_subtitle: () => t('auth.login.subtitle'),
  auth_login_loginButton: () => t('auth.login.loginButton'),
  auth_login_loggingIn: () => t('auth.login.loggingIn'),
  auth_login_forgotPassword: () => t('auth.login.forgotPassword'),
  auth_login_rememberMe: () => t('auth.login.rememberMe'),
  auth_login_noAccount: () => t('auth.login.noAccount'),
  auth_login_signUpLink: () => t('auth.login.signUpLink'),
  auth_login_continueWithGoogle: () => t('auth.login.continueWithGoogle'),
  auth_login_errorDefault: () => t('auth.login.errorDefault'),
  auth_login_errorUnexpected: () => t('auth.login.errorUnexpected'),
  auth_login_backgroundQuote: () => t('auth.login.backgroundQuote'),
  auth_signup_title: () => t('auth.signup.title'),
  auth_signup_subtitle: () => t('auth.signup.subtitle'),
  auth_signup_signUpButton: () => t('auth.signup.signUpButton'),
  auth_signup_creatingAccount: () => t('auth.signup.creatingAccount'),
  auth_signup_haveAccount: () => t('auth.signup.haveAccount'),
  auth_signup_loginLink: () => t('auth.signup.loginLink'),
  auth_signup_errorDefault: () => t('auth.signup.errorDefault'),
  auth_signup_errorUnexpected: () => t('auth.signup.errorUnexpected'),
  auth_signup_backgroundQuote: () => t('auth.signup.backgroundQuote'),
  auth_signup_backgroundTitle: () => t('auth.signup.backgroundTitle'),
  auth_signup_backgroundSubtitle: () => t('auth.signup.backgroundSubtitle'),
  account_title: () => t('account.title'),
  account_subtitle: () => t('account.subtitle'),
  account_profileInfo: () => t('account.profileInfo'),
  account_profileDescription: () => t('account.profileDescription'),
  account_balance: () => t('account.balance'),
  account_balanceDescription: () => t('account.balanceDescription'),
  account_raffleBalance: () => t('account.raffleBalance'),
  account_giveawayBalance: () => t('account.giveawayBalance'),
  account_memberSince: () => t('account.memberSince'),
  account_profilePicture: () => t('account.profilePicture'),
  account_errorLoading: () => t('account.errorLoading'),
  account_noSession: () => t('account.noSession'),
  account_balanceUnavailable: () => t('account.balanceUnavailable'),
  drawings_title: () => t('drawings.title'),
  drawings_new: () => t('drawings.new'),
  drawings_createdOn: () => t('drawings.createdOn'),
  drawings_selection: () => t('drawings.selection'),
  drawings_selectionManual: () => t('drawings.selectionManual'),
  drawings_selectionSystem: () => t('drawings.selectionSystem'),
  drawings_numbers: () => t('drawings.numbers'),
  drawings_type: () => t('drawings.type'),
  drawings_paid: () => t('drawings.paid'),
  drawings_ended: () => t('drawings.ended'),
  drawings_view: () => t('drawings.view'),
  drawings_copy: () => t('drawings.copy'),
  drawings_share: () => t('drawings.share'),
  drawings_linkCopied: () => t('drawings.linkCopied'),
  drawings_noDrawings: () => t('drawings.noDrawings'),
  drawings_loginRequired: () => t('drawings.loginRequired'),
}
