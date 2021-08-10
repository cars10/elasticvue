import { DEFAULT_LOCALE, SUPPORTED_COUNTRY_LOCALES } from '@/consts'

export const defaultLocale = () => {
  return process.env.VUE_APP_I18N_LOCALE || getBrowserLocale(navigator.languages) || DEFAULT_LOCALE
}

export const getBrowserLocale = (languages, fallback) => {
  if (!languages || languages.length === 0) return fallback

  const lang = languages[0]
  const matches = lang.trim().split(/[-_]/)
  if (!matches || matches.length === 0) return fallback

  const locale = matches[0]

  if (SUPPORTED_COUNTRY_LOCALES[locale]) {
    return SUPPORTED_COUNTRY_LOCALES[locale]
  } else {
    return fallback
  }
}
