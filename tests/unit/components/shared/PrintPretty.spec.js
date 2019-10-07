import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import PrintPretty from '@/components/shared/PrintPretty'
import { createLocalVue, mount } from '@vue/test-utils'
import { theme } from '@/store/modules/theme'
import '../../mocks/codeEditorMocks'

describe('components/shared/PrintPretty.vue', () => {
  let localVue
  let vuetify
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    vuetify = new Vuetify()
    Vue.use(Vuetify)
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: { theme }
    })
  })

  it('should render correct default contents', () => {
    const wrapper = mount(PrintPretty, { localVue, vuetify, store, sync: false })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('correctly sets the initialHeight of its resizableContainer', () => {
    const wrapper = mount(PrintPretty, {
      localVue,
      vuetify,
      store,
      sync: false,
      propsData: {
        initialHeight: 250
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })
})
