import Vuex from 'vuex'
import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import VGrid from 'vuetify/es5/components/VGrid'
import CodeEditor from '@/components/shared/CodeEditor'
import ResizableContainer from '@/components/shared/ResizableContainer'
import PrintPretty from '@/components/shared/PrintPretty'
import { createLocalVue, mount } from '@vue/test-utils'
import { theme } from '@/store/modules/theme'

describe('PrintPretty.vue', () => {
  let localVue
  let store

  before(() => {
    localVue = createLocalVue()

    localVue = createLocalVue()
    localVue.use(Vuex)
    localVue.use(Vuetify, {
      components: {
        CodeEditor,
        ResizableContainer,
        VBtn,
        VIcon,
        VGrid
      }
    })
    store = new Vuex.Store({
      modules: {theme}
    })
  })

  it('should render correct default contents', () => {
    const wrapper = mount(PrintPretty, {localVue, store})
    const height = 'height: 600px'
    expect(wrapper.find('div > div').attributes().style).contains(height)
  })
})
