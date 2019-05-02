import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import VSelect from 'vuetify/es5/components/VSelect'
import ReloadButton from '@/components/shared/ReloadButton'
import { createLocalVue, mount } from '@vue/test-utils'
import '../../mocks/vuetifyMocks'

describe('components/shared/ReloadButton.vue', () => {
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuetify, { components: { VBtn, VIcon, VSelect } })
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ReloadButton, { localVue: localVue })
    expect(wrapper.element).toMatchSnapshot()
  })

  it('has an empty default action', () => {
    const wrapper = mount(ReloadButton, { localVue: localVue })
    wrapper.find('#reload-button').trigger('click')
    expect(wrapper.element).toMatchSnapshot()
  })

  it('calls the assigned action on click', () => {
    const myAction = jest.fn()
    const wrapper = mount(ReloadButton, { localVue: localVue, propsData: { action: myAction } })
    wrapper.find('#reload-button').trigger('click')
    expect(myAction).toHaveBeenCalledTimes(1)
  })
})
