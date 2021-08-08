import Vue from 'vue'
import VueI18n from 'vue-i18n'
import store from '@/store'
import { DEFAULT_I18N, SUPPORTED_I18N } from '@/consts'
import en from '@/locales/en'

Vue.use(VueI18n)

const i18n = new VueI18n({
  lazy: true,
  locale: DEFAULT_I18N,
  fallbackLocale: DEFAULT_I18N,
  messages: { en }
})

const setI18n = lang => {
  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  return lang
}

const loadedLanguages = [DEFAULT_I18N]
export const loadLanguage = lang => {
  if (i18n.locale === lang || loadedLanguages.includes(lang)) {
    return Promise.resolve(setI18n(lang))
  }

  if (SUPPORTED_I18N[lang]) {
    loadedLanguages.push(lang)
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

// load user i18n
const currentI18n = store.state.language.language
loadLanguage(currentI18n)

export default i18n
