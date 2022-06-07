import Vue from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './vuetify'
import VueCompositionApi from '@vue/composition-api'
import './assets'
import i18n from './i18n'
import { DESKTOP_BUILD } from '@/consts'
import { register } from '@tauri-apps/api/globalShortcut'
import { exit } from '@tauri-apps/api/process'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
  router,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')

if (DESKTOP_BUILD) {
  register('CmdOrControl+Q', function () {
    exit(0).catch(e => console.log(e))
  }).catch(e => console.log(e))
}
