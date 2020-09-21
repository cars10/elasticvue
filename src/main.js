import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './vuetify'
import VueCompositionApi from '@vue/composition-api'
import './assets'
import { CONNECTION_STATES, DEFAULT_HOST } from '@/consts'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

const currentHost = store.state.connection.elasticsearchHost
if (typeof currentHost === 'string') {
  if (currentHost === DEFAULT_HOST) {
    store.commit('connection/setElasticsearchHost', { name: 'local', uri: DEFAULT_HOST, status: CONNECTION_STATES.UNKNOWN })
  } else {
    store.commit('connection/setElasticsearchHost', { name: 'custom', uri: currentHost, status: CONNECTION_STATES.UNKNOWN })
  }
}

if (Object.keys(store.state.connection.elasticsearchInstances).length === 0) {
  store.commit('connection/addElasticsearchInstance', store.state.connection.elasticsearchHost)
}

// store.commit('connection/addElasticsearchInstance', { name: 'local2', uri: DEFAULT_HOST, status: CONNECTION_STATES.UNKNOWN })
