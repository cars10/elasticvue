import Vue from 'vue'
import VueMaterial from 'vue-material'

// Vue-Material
import 'vue-material/dist/components/mdCore/index.css'
import 'vue-material/dist/components/mdBackdrop/index.css'
import 'vue-material/dist/components/mdButton/index.css'
import 'vue-material/dist/components/mdCard/index.css'
import 'vue-material/dist/components/mdCheckbox/index.css'
import 'vue-material/dist/components/mdChips/index.css'
import 'vue-material/dist/components/mdInputContainer/index.css'
import 'vue-material/dist/components/mdLayout/index.css'
import 'vue-material/dist/components/mdList/index.css'
import 'vue-material/dist/components/mdMenu/index.css'
import 'vue-material/dist/components/mdProgress/index.css'
import 'vue-material/dist/components/mdSelect/index.css'
import 'vue-material/dist/components/mdTable/index.css'
import 'vue-material/dist/components/mdToolbar/index.css'

Vue.use(VueMaterial.MdCore)
Vue.use(VueMaterial.MdBackdrop)
Vue.use(VueMaterial.MdButton)
Vue.use(VueMaterial.MdCard)
Vue.use(VueMaterial.MdCheckbox)
Vue.use(VueMaterial.MdChips)
Vue.use(VueMaterial.MdIcon)
Vue.use(VueMaterial.MdInputContainer)
Vue.use(VueMaterial.MdLayout)
Vue.use(VueMaterial.MdList)
Vue.use(VueMaterial.MdMenu)
Vue.use(VueMaterial.MdProgress)
Vue.use(VueMaterial.MdSelect)
Vue.use(VueMaterial.MdTable)
Vue.use(VueMaterial.MdToolbar)

// Base styles
import './stylesheets/style.scss'

Vue.material.registerTheme('default', {
  primary: 'teal',
  accent: 'purple',
  warn: 'red'
})
