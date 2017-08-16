import Vue from 'vue'
import VueMaterial from 'vue-material'

// Vue-Material
import 'vue-material/dist/components/mdCore/index.css'
import 'vue-material/dist/components/mdButton/index.css'
import 'vue-material/dist/components/mdChips/index.css'
import 'vue-material/dist/components/mdInputContainer/index.css'
import 'vue-material/dist/components/mdLayout/index.css'
import 'vue-material/dist/components/mdProgress/index.css'
import 'vue-material/dist/components/mdTable/index.css'
import 'vue-material/dist/components/mdToolbar/index.css'

Vue.use(VueMaterial.MdCore)
Vue.use(VueMaterial.MdButton)
Vue.use(VueMaterial.MdChips)
Vue.use(VueMaterial.MdIcon)
Vue.use(VueMaterial.MdInputContainer)
Vue.use(VueMaterial.MdLayout)
Vue.use(VueMaterial.MdProgress)
Vue.use(VueMaterial.MdTable)
Vue.use(VueMaterial.MdToolbar)

// Base styles
import './stylesheets/style.scss'

Vue.material.registerTheme('default', {
  primary: 'teal',
  accent: 'purple',
  warn: 'red'
})
