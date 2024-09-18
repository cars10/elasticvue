import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ValidTheme } from '../consts.ts'

export type ThemeState = {
  dark: ValidTheme
}

const mql = window.matchMedia('(prefers-color-scheme: dark)')
const prefersDark = ref(mql.matches)
mql.addEventListener('change', () => {
  prefersDark.value = mql.matches
  useThemeStore().updateThemeClass()
})

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    dark: 'auto'
  }),
  getters: {
    isDark(state) {
      return state.dark === 'auto' ? prefersDark.value : state.dark
    }
  },
  actions: {
    setTheme(theme: ValidTheme) {
      this.dark = theme
      this.updateThemeClass()
    },

    updateThemeClass() {
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
