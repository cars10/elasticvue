import { defineStore } from 'pinia'
import { defaultLocale } from '../helpers/i18n'
import { ValidLocale } from '../consts.ts'

export type I18nState = {
  language: ValidLocale
}

export const useI18nStore = defineStore('i18n', {
  state: (): I18nState => ({
    language: defaultLocale()
  }),
  actions: {
    setLanguage (language: ValidLocale) {
      this.language = language
    }
  },
  persist: true
})
