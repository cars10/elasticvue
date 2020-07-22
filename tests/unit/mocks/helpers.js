import { createLocalVue } from '@vue/test-utils'
import Vuetify from 'vuetify'
import VueCompositionApi from '@vue/composition-api'

export const buildLocalVue = function () {
  let localVue = createLocalVue()
  localVue.use(Vuetify)
  localVue.use(VueCompositionApi)
  return localVue
}
