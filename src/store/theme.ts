import { defineStore } from 'pinia'

export enum ThemePreferences  {
  light = 'light',
  dark = 'dark',
  auto = 'auto'
}

export enum AppThemes {
  light = 'light',
  dark = 'dark'
}

export type ThemeState = {
  preference: ThemePreferences,
  appTheme: AppThemes
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    preference: ThemePreferences.auto,
    appTheme: window.matchMedia('(prefers-color-scheme: light)').matches ? AppThemes.light : AppThemes.dark
  }),
  actions: {
    setPreference(preference: ThemePreferences) {
      this.preference = preference

      if (preference === ThemePreferences.auto) {
        this.appTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? AppThemes.light : AppThemes.dark
      } else {
        this.appTheme = preference as unknown as AppThemes
      }
    }
  },
  persist: true
})
