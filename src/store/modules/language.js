import { defaultLocale } from '@/helpers/i18n'

export const language = {
  namespaced: true,
  state: {
    language: defaultLocale()
  },
  mutations: {
    setLanguage (state, language) {
      state.language = language
    }
  }
}
