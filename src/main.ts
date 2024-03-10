import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { quasarOptions } from './plugins/quasar'
import { pinia } from './plugins/pinia'
import { vueI18n } from './plugins/vue-i18n'
import router from './router'

import App from './App.vue'
import './assets/stylesheets/style.scss'
import { migrate } from './services/VuexMigrator.ts'

migrate()
const myApp = createApp(App)

myApp.use(Quasar, quasarOptions)
myApp.use(pinia)
myApp.use(vueI18n())
myApp.use(router)
myApp.mount('#app')
