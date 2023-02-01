import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import en from 'vuetify/lib/locale/en'
import zhHans from 'vuetify/lib/locale/zh-Hans'

import store from '@/store'
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

const basicColors = {
  success: colors.green.darken3,
  error: colors.red.darken4,
  'primary-button': colors.blue.darken2
}

const getVuetifyLocale = () => {
  const currentLocale = store.state.language.language

  switch (currentLocale) {
    case 'cn':
      return 'zhHans'
    default:
      return currentLocale
  }
}

const vuetify = new Vuetify({
  icons: { iconfont: 'mdi' },
  theme: {
    themes: {
      dark: basicColors,
      light: basicColors
    },
    dark: store.state.theme.dark
  },
  lang: {
    locales: { en, zhHans },
    current: getVuetifyLocale()
  }
})

export default vuetify
