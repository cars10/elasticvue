import Vue from 'vue'
import { mount } from '@vue/test-utils'
import ContentToggle from '@/components/shared/ContentToggle'

describe('components/shared/ContentToggle.vue', () => {
  it('should render correct default contents', () => {
    const wrapper = mount(ContentToggle)
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should render toggled content', async () => {
    const wrapper = mount(ContentToggle)
    let activator = wrapper.find('.content-toggle__last_activator')
    activator.trigger('click')
    await Vue.nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should render original content', async () => {
    const wrapper = mount(ContentToggle)
    let lastActivator = wrapper.find('.content-toggle__last_activator')
    lastActivator.trigger('click')
    await Vue.nextTick()
    let firstActivator = wrapper.find('.content-toggle__first_activator')
    firstActivator.trigger('click')
    await Vue.nextTick()
    expect(wrapper.element).toMatchSnapshot()
  })
})
