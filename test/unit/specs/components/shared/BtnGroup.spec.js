import BtnGroup from '@/components/shared/BtnGroup'
import { mount } from '@vue/test-utils'

describe('BtnGroup.vue', () => {
  it('should render correct default contents', () => {
    const wrapper = mount(BtnGroup)
    expect(wrapper.classes()).contains('elevation-1')
    expect(wrapper.classes()).contains('btn-group')
  })

  it('should add the small group', () => {
    const wrapper = mount(BtnGroup, {
      propsData: {
        small: true
      }
    })
    expect(wrapper.classes()).contains('btn-group--small')
  })
})
