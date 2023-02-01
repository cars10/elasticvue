import { defineStore } from 'pinia'
import { Dark } from 'quasar'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    dark: window.matchMedia('(prefers-color-scheme: dark)').matches
  }),
  actions: {
    setDark (dark) {
      this.dark = dark
      Dark.set(this.dark)
    },
    toggleTheme () {
      this.setDark(!this.dark)
    }
  },
  persist: true
})
