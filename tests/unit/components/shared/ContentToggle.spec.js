import { mount } from '@vue/test-utils'
import ContentToggle from '@/components/shared/ContentToggle'

describe('components/shared/ContentToggle.vue', () => {
  it('should render correct default contents', () => {
    const wrapper = mount(ContentToggle)
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should render toggled content', () => {
    const wrapper = mount(ContentToggle)
    let activator = wrapper.find('.content-toggle__last_activator')
    activator.trigger('click')
    expect(wrapper.element).toMatchSnapshot()
  })

  it('should render original content', () => {
    const wrapper = mount(ContentToggle)
    let lastActivator = wrapper.find('.content-toggle__last_activator')
    lastActivator.trigger('click')
    let firstActivator = wrapper.find('.content-toggle__first_activator')
    firstActivator.trigger('click')
    expect(wrapper.element).toMatchSnapshot()
  })
})
