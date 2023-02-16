import white from '../assets/images/logo/white_96.png'
import blue from '../assets/images/logo/blue_96.png'
import { useThemeStore } from '../store/theme'
import { computed } from 'vue'

export const useLogo = () => {
  const themeStore = useThemeStore()

  return computed(() => {
    if (themeStore.dark) {
      return white
    } else {
      return blue
    }
  })
}
