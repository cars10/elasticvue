import { defineStore } from 'pinia'
import { defaultLocale } from '../helpers/i18n'

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    language: defaultLocale()
  }),
  actions: {
    setLanguage (language) {
      this.language = language
    }
  },
  persist: true
})
