import { DEFAULT_LOCALE, SUPPORTED_COUNTRY_LOCALES, ValidLocale } from '../consts'

export const defaultLocale = (): ValidLocale => {
  return getBrowserLocale(navigator.languages, DEFAULT_LOCALE) || DEFAULT_LOCALE
}

export const getBrowserLocale = (languages: readonly string[], fallback: ValidLocale): ValidLocale => {
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
