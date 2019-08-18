import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import store from '@/store'
import '@mdi/font/css/materialdesignicons.css'

Vue.use(Vuetify)

const vuetify = new Vuetify({ icons: { iconfont: 'mdi' }, theme: { dark: store.state.theme.dark } })

export default vuetify
