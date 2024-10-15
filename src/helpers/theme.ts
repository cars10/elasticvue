import { AppThemes, ThemePreferences, useThemeStore } from '../store/theme.ts'

export const setAppThemeCss = (theme: AppThemes) => {
  if (theme === AppThemes.light) {
    document.body.classList.add('theme--light')
    document.body.classList.remove('theme--dark')
  } else {
    document.body.classList.add('theme--dark')
    document.body.classList.remove('theme--light')
  }
}

export const setupThemeListener = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)')
  const themeStore = useThemeStore()

  mediaQuery.addEventListener('change', (e) => {
    if (themeStore.preference !== ThemePreferences.auto) return

    const appTheme = e.matches ? AppThemes.light : AppThemes.dark
    themeStore.appTheme = appTheme

    setAppThemeCss(appTheme)
  })
}