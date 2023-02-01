import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from '@/store'
import { DEFAULT_LOCALE, SUPPORTED_COUNTRY_LOCALES } from '@/consts'
import en from '@/locales/en'
import cn from '@/locales/cn'

Vue.use(VueI18n)

const currentI18n = store.state.language.language

const i18n = new VueI18n({
  lazy: true,
  locale: currentI18n,
  fallbackLocale: DEFAULT_LOCALE,
  messages: { en, cn }
})

export const setLocale = lang => {
  if (!SUPPORTED_COUNTRY_LOCALES[lang]) return false

  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}
setLocale(currentI18n)

export default i18n
