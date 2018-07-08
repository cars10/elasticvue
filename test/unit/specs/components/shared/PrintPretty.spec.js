import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import VGrid from 'vuetify/es5/components/VGrid'
import CodeEditor from '@/components/shared/CodeEditor'
import ResizableContainer from '@/components/shared/ResizableContainer'
import PrintPretty from '@/components/shared/PrintPretty'
import { createLocalVue, mount } from '@vue/test-utils'

describe('PrintPretty.vue', () => {
  let localVue = createLocalVue()
  localVue.use(Vuetify, {
    components: {
      CodeEditor,
      ResizableContainer,
      VBtn,
      VIcon,
      VGrid
    }
  })

  it('should render correct default contents', () => {
    const wrapper = mount(PrintPretty, {localVue})
    const height = 'height: 600px'
    expect(wrapper.find('div > div').attributes().style).contains(height)
  })
})
