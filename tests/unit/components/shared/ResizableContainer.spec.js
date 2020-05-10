import Vue from 'vue'
import Vuetify from 'vuetify'
import ResizableContainer from '@/components/shared/ResizableContainer'
import { createLocalVue, mount } from '@vue/test-utils'
import '../../mocks/resizableContainerMocks'

function createElement () {
  if (document) {
    const elem = document.createElement('div')

    if (document.body) {
      document.body.appendChild(elem)
    }
    return elem
  }
}

describe('components/shared/ResizableContainer.vue', () => {
  let localVue
  let vuetify

  beforeEach(() => {
    localVue = createLocalVue()
    vuetify = new Vuetify()
    Vue.use(Vuetify)
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ResizableContainer, { localVue, vuetify })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should render correct initialHeight', () => {
    const wrapper = mount(ResizableContainer, {
      localVue,
      vuetify,
      propsData: {
        initialHeight: 500
      }
    })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should increase the height on drag', async () => {
    const wrapper = mount(ResizableContainer, {
      localVue,
      vuetify,
      attachTo: createElement()
    })
    const handler = wrapper.find('div.resizable-container__vertical-handler')

    const startY = 0
    const endY = 100

    handler.trigger('mousedown', { pageY: startY })
    handler.trigger('mousemove', { pageY: endY })
    handler.trigger('mouseup')
    await Vue.nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should increase the height on drag and scroll if needed', async () => {
    const wrapper = mount(ResizableContainer, {
      localVue,
      vuetify,
      attachTo: createElement()
    })
    const handler = wrapper.find('div.resizable-container__vertical-handler')

    const startY = 0
    const endY = 1000

    handler.trigger('mousedown', { pageY: startY, clientY: startY })
    handler.trigger('mousemove', { pageY: endY, clientY: endY })
    handler.trigger('mouseup')
    await Vue.nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should not decrease the height lower then initialHeight', async () => {
    const wrapper = mount(ResizableContainer, {
      localVue,
      vuetify,
      attachTo: createElement()
    })
    const handler = wrapper.find('div.resizable-container__vertical-handler')

    const startY = 100
    const endY = 0

    handler.trigger('mousedown', { pageY: startY })
    handler.trigger('mousemove', { pageY: endY })
    handler.trigger('mouseup')
    await Vue.nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })
})
