import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import BackButton from '@/components/shared/BackButton'
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'

describe('BackButton.vue', () => {
  it('should render correct contents', () => {
    let localVue = createLocalVue()
    localVue.use(Vuetify, {
      components: {
        VBtn,
        VIcon
      }
    })

    const wrapper = mount(BackButton, {
      localVue: localVue,
      stubs: {
        'router-link': RouterLinkStub
      }
    })
    expect(wrapper.find('div').text()).contains('keyboard_arrow_left')
    expect(wrapper.find('div').text()).contains('Back')
    expect(wrapper.find('div').text()).to.not.be.empty
  })
})
