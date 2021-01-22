import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './vuetify'
import VueCompositionApi from '@vue/composition-api'
import './assets'

Vue.use(VueCompositionApi)
Vue.config.productionTip = false

// migrate instances from 0.31.0 to 0.32.0 by splitting the uri into {uri, username, password}
if (!store.state.connection.instanceCredentialsMigrated && store.state.connection.instances.length > 0) {
  let delInstances = 0
  store.state.connection.instances.forEach(instance => {
    try {
      const newInstance = Object.assign({}, instance)
      newInstance.name = `[Migrated] ${newInstance.name}`
      if (newInstance.uri.indexOf('@') > -1) {
        const credentials = newInstance.uri.match(/https?:\/\/(.*(:.*)?)@/)[1]
        const parts = credentials.split(':')
        newInstance.username = parts[0] || ''
        newInstance.password = parts[1] || ''
        newInstance.uri = newInstance.uri.replace(credentials + '@', '')
      } else {
        newInstance.username = ''
        newInstance.password = ''
      }
      store.commit('connection/addElasticsearchInstance', newInstance)
    } catch (e) {
    }
    delInstances += 1
  })

  for (let i = 0; i < delInstances; i++) {
    store.commit('connection/removeInstance', 0)
  }
  store.commit('connection/setActiveInstanceIdx', 0)
  store.commit('connection/setInstanceCredentialsMigrated', true)
}

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')
