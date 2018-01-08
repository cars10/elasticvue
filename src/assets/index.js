import Vue from 'vue'
import VApp from 'vuetify/es5/components/VApp'
import VBtn from 'vuetify/es5/components/VBtn'
import VCard from 'vuetify/es5/components/VCard'
import VChip from 'vuetify/es5/components/VChip'
import VDataTable from 'vuetify/es5/components/VDataTable'
import VGrid from 'vuetify/es5/components/VGrid'
import VForm from 'vuetify/es5/components/VForm'
import VSelect from 'vuetify/es5/components/VSelect'
import VTextField from 'vuetify/es5/components/VTextField'
import VToolbar from 'vuetify/es5/components/VToolbar'
import Vuetify from 'vuetify/es5/components/Vuetify'

// Base styles
import './stylesheets/style.scss'

// Vuetify styles
// TODO: only load used styles! see https://vuetifyjs.com/vuetify/a-la-carte
import 'vuetify/src/stylus/app.styl'

Vue.use(Vuetify)
Vue.use(VApp)
Vue.use(VBtn)
Vue.use(VCard)
Vue.use(VChip)
Vue.use(VDataTable)
Vue.use(VGrid)
Vue.use(VForm)
Vue.use(VSelect)
Vue.use(VTextField)
Vue.use(VToolbar)
