import { getBrowserLocale } from '@/helpers/i18n'

const FALLBACK_LOCALE = 'en'

describe('helpers/i18n.js', () => {
  describe('getBrowserLocale', () => {
    it('should return fallback locale if null languages are passed', () => {
      const locale = getBrowserLocale(null, FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if undefined languages are passed', () => {
      const locale = getBrowserLocale(undefined, FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if empty array languages are passed', () => {
      const locale = getBrowserLocale([], FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if empty string languages are passed', () => {
      const locale = getBrowserLocale('', FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if "a" string languages are passed', () => {
      const locale = getBrowserLocale('a', FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if ["a"] languages are passed', () => {
      const locale = getBrowserLocale(['a'], FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if ["a"] languages are passed', () => {
      const locale = getBrowserLocale(['a'], FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return fallback locale if unsupported languages are passed', () => {
      const locale = getBrowserLocale(['it'], FALLBACK_LOCALE)
      expect(locale).toEqual(FALLBACK_LOCALE)
    })

    it('should return locale if supported languages are passed', () => {
      const locale = getBrowserLocale(['cn-CN'], FALLBACK_LOCALE)
      expect(locale).toEqual('cn')
    })
  })
})
