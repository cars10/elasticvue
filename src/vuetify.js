import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import store from '@/store'
import '@mdi/font/css/materialdesignicons.css'
import colors from 'vuetify/lib/util/colors'

Vue.use(Vuetify)

const basicColors = {
  success: colors.green.darken3,
  'primary-button': colors.blue.darken2
}

const vuetify = new Vuetify({
  icons: { iconfont: 'mdi' },
  theme: {
    themes: {
      dark: basicColors,
      light: basicColors
    },
    dark: store.state.theme.dark
  }
})

export default vuetify
