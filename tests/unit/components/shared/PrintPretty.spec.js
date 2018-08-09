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
import '../../mocks/codeEditorMocks'

describe('components/shared/PrintPretty.vue', () => {
  let localVue
  let store

  beforeEach(() => {
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
    expect(wrapper.find('div > div').element.style.height).toEqual(`${wrapper.vm.initialHeight}px`)
  })

  it('correctly sets the initialHeight of its resizableContainer', () => {
    const height = 250
    const wrapper = mount(PrintPretty, {
      localVue: localVue,
      store: store,
      propsData: {
        initialHeight: height
      }
    })
    expect(wrapper.find('div > div').element.style.height).toEqual(`${height}px`)
  })
})
