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
    const initialHeight = wrapper.props().initialHeight

    expect(wrapper.text()).contains('vertical_align_center')
    expect(resizedWrapper.attributes().style).to.include(initialHeight)
  })

  it('should render correct initialHeight', () => {
    const height = 500
    const heightStyle = `height: ${height}px`
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      propsData: {
        initialHeight: height
      }
    })
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})
    expect(resizedWrapper.attributes().style).to.include(heightStyle)
  })

  it('should increase the height on drag', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      attachToDocument: true
    })
    const button = wrapper.find('button')
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const startY = 0
    const endY = 100
    const distance = endY - startY
    const initialHeight = wrapper.props().initialHeight
    const heightStyle = `height: ${initialHeight + distance}px`

    button.trigger('mousedown', {pageY: startY})
    button.trigger('mousemove', {pageY: endY})
    button.trigger('mouseup')
    expect(resizedWrapper.attributes().style).to.include(heightStyle)
  })

  it('should not decrease the height lower then intialHeight', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      attachToDocument: true
    })
    const button = wrapper.find('button')
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const startY = 100
    const endY = 0
    const distance = endY - startY
    const initialHeight = wrapper.props().initialHeight
    const initialHeightStyle = `height: ${initialHeight}px`
    const heightStyle = `height: ${initialHeight + distance}px`

    button.trigger('mousedown', {pageY: startY})
    button.trigger('mousemove', {pageY: endY})
    button.trigger('mouseup')
    expect(resizedWrapper.attributes().style).to.not.include(heightStyle)
    expect(resizedWrapper.attributes().style).to.include(initialHeightStyle)
  })

  it('can be destroyed', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      attachToDocument: true
    })
    expect(wrapper.destroy())
  })
})
