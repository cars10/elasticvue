import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import ReloadButton from '@/components/shared/ReloadButton'
import { createLocalVue, mount } from '@vue/test-utils'

describe('components/shared/ReloadButton.vue', () => {
  let localVue

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuetify, {
      components: {
        VBtn,
        VIcon
      }
    })
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ReloadButton, {
      localVue: localVue
    })

    expect(wrapper.attributes().title).toEqual('Reload')
    expect(wrapper.attributes().id).toEqual('reload-button')
    expect(wrapper.html()).not.toBeNull()
  })

  it('renders a custom title', () => {
    const title = 'myCustom title'
    const wrapper = mount(ReloadButton, {
      localVue: localVue,
      propsData: {
        title
      }
    })

    expect(wrapper.attributes().title).toEqual(title)
  })
})
