import white from '../assets/images/logo/white_96.png'
import blue from '../assets/images/logo/blue_96.png'
import { AppThemes, useThemeStore } from '../store/theme.ts'
import { computed } from 'vue'

export const useLogo = () => {
  const themeStore = useThemeStore()

  return computed(() => {
    if (themeStore.appTheme === AppThemes.light) {
      return blue
    } else {
      return white
    }
  })
}
