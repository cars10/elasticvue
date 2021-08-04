import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

function loadLocaleMessages () {
  const locales = require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i)
  const messages = {}
  locales.keys().forEach(key => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i)
    if (matched && matched.length > 1) {
      const locale = matched[1]
      messages[locale] = locales(key)
    }
  })
  return messages
}

function getBrowserLocale (options = {}) {
  const defaultOptions = { countryCodeOnly: false }
  const opt = { ...defaultOptions, ...options }
  const navigatorLocale =
    navigator.languages !== undefined
      ? navigator.languages[0]
      : navigator.language
  if (!navigatorLocale) {
    return undefined
  }
  const trimmedLocale = opt.countryCodeOnly
    ? navigatorLocale.trim().split(/-|_/)[0]
    : navigatorLocale.trim()
  return trimmedLocale
}

function supportedLocalesInclude (locale) {
  const supportedLocales = {
    en: 'English',
    cn: '简体中文'
  }
  return Object.keys(supportedLocales).includes(locale)
}

function getStartingLocale () {
  const browserLocale = getBrowserLocale({ countryCodeOnly: true })
  if (supportedLocalesInclude(browserLocale)) {
    return browserLocale
  } else {
    return process.env.VUE_APP_I18N_LOCALE || 'en'
  }
}

export default new VueI18n({
  lazy: true,
  locale: getStartingLocale(),
  fallbackLocale: process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en',
  // silentFallbackWarn: false,
  messages: loadLocaleMessages()
})
