import { DEFAULT_I18N, SUPPORTED_I18N } from '@/consts'
import { getBrowserLocale } from '@/helpers/i18n'

export const language = {
  namespaced: true,
  state: {
    language: SUPPORTED_I18N[getBrowserLocale()] || process.env.VUE_APP_I18N_LOCALE || DEFAULT_I18N
  },
  mutations: {
    setLanguage (state, language) {
      state.language = language
    }
  }
}
