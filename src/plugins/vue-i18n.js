import { createI18n } from 'vue-i18n/dist/vue-i18n.cjs.js'
import en from '../locales/en'
import cn from '../locales/cn'
import { useI18nStore } from '../store/i18n'

export const vueI18n = () => {
  const store = useI18nStore()
  const language = store.language || 'en'

  document.querySelector('html').setAttribute('lang', language)

  return createI18n({
    lazy: true,
    legacy: false,
    locale: language,
    fallbackLocale: 'en',
    messages: { en, cn },
    warnHtmlMessage: false
  })
}
