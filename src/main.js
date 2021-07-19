import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './vuetify'
import VueCompositionApi from '@vue/composition-api'
import './assets'
import i18n from './i18n'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App)
}).$mount('#app')
