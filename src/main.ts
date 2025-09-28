import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { quasarOptions } from './plugins/quasar'
import { pinia } from './plugins/pinia'
import { vueI18n } from './plugins/vue-i18n'
import router from './router'
import qDraggableTable from 'quasar-ui-q-draggable-table'
import 'quasar-ui-q-draggable-table/dist/index.css'

import App from './App.vue'
import './assets/stylesheets/style.scss'
import { migrate } from './services/migrations.ts'
import { setUuid } from './services/Uuid.ts'
import { buildConfig } from './buildConfig.ts'
import { importPredefinedClusters } from './composables/components/predefinedclusters/PredefinedClusters.ts'

const setup = async () => {
  migrate()
  setUuid()

  if (buildConfig.checkPredefinedClusters) await importPredefinedClusters()

  const myApp = createApp(App)
  myApp.use(Quasar, quasarOptions)
  myApp.use(qDraggableTable)
  myApp.use(pinia)
  myApp.use(vueI18n())
  myApp.use(router)
  myApp.mount('#app')
}
setup()