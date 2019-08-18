import Vue from 'vue'
import Vuetify from 'vuetify'
import ReloadButton from '@/components/shared/ReloadButton'
import { createLocalVue, mount } from '@vue/test-utils'
import '../../mocks/vuetifyMocks'

describe('components/shared/ReloadButton.vue', () => {
  let localVue
  let vuetify

  beforeEach(() => {
    localVue = createLocalVue()
    vuetify = new Vuetify()
    Vue.use(Vuetify)
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ReloadButton, { localVue, vuetify })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('has an empty default action', () => {
    const wrapper = mount(ReloadButton, { localVue, vuetify })
    wrapper.find('#reload-button').trigger('click')
    expect(wrapper.element).toMatchSnapshot()
  })

  it('calls the assigned action on click', () => {
    const myAction = jest.fn()
    const wrapper = mount(ReloadButton, { localVue, vuetify, propsData: { action: myAction } })
    wrapper.find('#reload-button').trigger('click')
    expect(myAction).toHaveBeenCalledTimes(1)
  })
})
