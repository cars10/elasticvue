import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import BackButton from '@/components/shared/BackButton'
import { createLocalVue, mount, RouterLinkStub } from '@vue/test-utils'

describe('components/shared/BackButton.vue', () => {
  let localVue

  before(() => {
    localVue = createLocalVue()
    localVue.use(Vuetify, {
      components: {
        VBtn,
        VIcon
      }
    })
  })

  it('should render correct default contents', () => {
    const wrapper = mount(BackButton, {
      localVue: localVue,
      stubs: {
        'router-link': RouterLinkStub
      }
    })
    expect(wrapper.text()).contains('keyboard_arrow_left')
    expect(wrapper.text()).contains('Back')
    expect(wrapper.find('div').text()).to.not.be.empty
  })

  it('should render custom text', () => {
    const text = 'myCustom Text'
    const wrapper = mount(BackButton, {
      localVue: localVue,
      stubs: {
        'router-link': RouterLinkStub
      },
      propsData: {
        text
      }
    })

    expect(wrapper.text()).contains(text)
  })

  it('should render custom icon', () => {
    const icon = 'cached'
    const wrapper = mount(BackButton, {
      localVue: localVue,
      stubs: {
        'router-link': RouterLinkStub
      },
      propsData: {
        icon
      }
    })

    expect(wrapper.text()).contains(icon)
  })
})
