import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import BackButton from '@/components/shared/BackButton'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'

describe('components/shared/BackButton.vue', () => {
  it('should render correct default contents', () => {
    let localVue = createLocalVue()
    localVue.use(Vuetify, { components: { VBtn, VIcon } })

    const wrapper = mount(BackButton, {
      localVue: localVue,
      stubs: {
        'router-link': RouterLinkStub
      }
    })

    expect(wrapper.element).toMatchSnapshot()
  })
})
