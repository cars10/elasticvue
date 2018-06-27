import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import VGrid from 'vuetify/es5/components/VGrid'
import ResizableContainer from '@/components/shared/ResizableContainer'
import BtnGroup from '@/components/shared/BtnGroup'
import { createLocalVue, mount } from '@vue/test-utils'

describe('ResizableContainer.vue', () => {
  let localVue = createLocalVue()
  localVue.use(Vuetify, {
    components: {
      BtnGroup,
      VBtn,
      VIcon,
      VGrid
    }
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ResizableContainer, {localVue})
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})
    const height = '350px;'

    expect(wrapper.text()).contains('vertical_align_center')
    expect(resizedWrapper.attributes().style).contains(height)
  })

  it('should render correct initialHeight', () => {
    const height = '500px;'
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      propsData: {
        initialHeight: 500
      }
    })
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})
    expect(resizedWrapper.attributes().style).contains(height)
  })
})
