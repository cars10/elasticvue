import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import VGrid from 'vuetify/es5/components/VGrid'
import ResizableContainer from '@/components/shared/ResizableContainer'
import BtnGroup from '@/components/shared/BtnGroup'
import { createLocalVue, mount } from '@vue/test-utils'
import '../../mocks/codeEditorMocks'

describe('components/shared/ResizableContainer.vue', () => {
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuetify, {
      components: {
        BtnGroup,
        VBtn,
        VIcon,
        VGrid
      }
    })
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ResizableContainer, { localVue })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should render correct initialHeight', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      propsData: {
        initialHeight: 500
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should increase the height on drag', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      attachToDocument: true
    })
    const handler = wrapper.find('div.resizable-container__vertical-handler')

    const startY = 0
    const endY = 100

    handler.trigger('mousedown', { pageY: startY })
    handler.trigger('mousemove', { pageY: endY })
    handler.trigger('mouseup')
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should increase the height on drag and scroll if needed', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      attachToDocument: true
    })
    const handler = wrapper.find('div.resizable-container__vertical-handler')

    const startY = 0
    const endY = 1000

    handler.trigger('mousedown', { pageY: startY, clientY: startY })
    handler.trigger('mousemove', { pageY: endY, clientY: endY })
    handler.trigger('mouseup')
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should not decrease the height lower then intialHeight', () => {
    const wrapper = mount(ResizableContainer, {
      localVue: localVue,
      attachToDocument: true
    })
    const handler = wrapper.find('div.resizable-container__vertical-handler')

    const startY = 100
    const endY = 0

    handler.trigger('mousedown', { pageY: startY })
    handler.trigger('mousemove', { pageY: endY })
    handler.trigger('mouseup')
    expect(wrapper.element).toMatchSnapshot()
  })
})
