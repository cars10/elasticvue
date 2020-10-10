import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './vuetify'
import VueCompositionApi from '@vue/composition-api'
import './assets'
import { CONNECTION_STATES, DEFAULT_HOST, DEFAULT_NAME } from '@/consts'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

const oldHost = store.state.connection.elasticsearchHost
if (store.state.connection.instances.length === 0 && typeof oldHost === 'string' && oldHost.length > 0) {
  const name = oldHost === DEFAULT_HOST ? DEFAULT_NAME : 'custom'

  store.commit('connection/addElasticsearchInstance', {
    name: name,
    uri: oldHost,
    status: CONNECTION_STATES.UNKNOWN
  })
  store.commit('connection/setElasticsearchHost', null)
}
