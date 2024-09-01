import { defineStore } from 'pinia'
import { ValidTheme } from '../consts.ts'

export type ThemeState = {
  dark: ValidTheme
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    dark: 'auto'
  }),
  getters: {
    isDark(state) {
      return state.dark === 'auto' ? window.matchMedia('(prefers-color-scheme: dark)').matches : state.dark
    }
  },
  actions: {
    setTheme(theme: ValidTheme) {
      this.dark = theme

      if (this.isDark) {
        document.body.classList.add('theme--dark')
        document.body.classList.remove('theme--light')
      } else {
        document.body.classList.add('theme--light')
        document.body.classList.remove('theme--dark')
      }
    }
  },
  persist: true
})
