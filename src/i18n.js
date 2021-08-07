import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from '@/store'
import { DEFAULT_I18N, SUPPORTED_I18N } from '@/consts'

Vue.use(VueI18n)

const currentI18n = store.state.language.language
const loadedLanguages = [currentI18n]
const messages = {}
messages[currentI18n] = require(`@/locales/${currentI18n}.json`)

const i18n = new VueI18n({
  lazy: true,
  locale: currentI18n,
  fallbackLocale: DEFAULT_I18N,
  messages
})

const setI18n = lang => {
  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

export const loadLanguage = lang => {
  if (i18n.locale === lang || loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18n(lang))
  }

  if (SUPPORTED_I18N[lang]) {
    return import(/* webpackChunkName: "lang-[request]" */ `@/locales/${lang}.json`).then(
      messages => {
        i18n.setLocaleMessage(lang, messages.default)
        return Promise.resolve(setI18n(lang))
      }
    )
  } else {
    return Promise.reject(lang)
  }
}

export default i18n
