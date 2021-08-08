import { DEFAULT_I18N, SUPPORTED_I18N } from '@/consts'

export const defaultLocale = () => {
  return process.env.VUE_APP_I18N_LOCALE || getBrowserLocale(navigator.languages) || DEFAULT_I18N
}

export const getBrowserLocale = (languages, fallback) => {
  if (!languages || languages.length === 0) return fallback

  const lang = languages[0]
  const matches = lang.trim().split(/[-_]/)
  if (!matches || matches.length === 0) return fallback

  const countryCode = matches[0]
  if (!SUPPORTED_I18N[countryCode]) return fallback

  return countryCode
}
