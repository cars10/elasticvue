import Vuetify from 'vuetify'
import VBtn from 'vuetify/es5/components/VBtn'
import VIcon from 'vuetify/es5/components/VIcon'
import VGrid from 'vuetify/es5/components/VGrid'
import ResizableContainer from '@/components/shared/ResizableContainer'
import BtnGroup from '@/components/shared/BtnGroup'
import { createLocalVue, mount } from '@vue/test-utils'

describe('ResizableContainer.vue', () => {
  let localVue = createLocalVue()
  localVue.use(Vuetify, {
    components: {
      BtnGroup,
      VBtn,
      VIcon,
      VGrid
    }
  })

  it('should render correct default contents', () => {
    const wrapper = mount(ResizableContainer, {localVue})

    expect(wrapper.text()).contains('arrow_upward')
    expect(wrapper.text()).contains('arrow_downward')
  })

  it('should increase the height when clicking the arrow_upward', () => {
    const wrapper = mount(ResizableContainer, {localVue})
    const increaseHeightButton = wrapper.find({ref: 'increaseHeightButton'})
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const initialHeight = wrapper.props().initialHeight
    const stepSize = wrapper.props().stepSize
    const expectedInitial = heightString(initialHeight)
    const expected = heightString(initialHeight + stepSize)

    expect(resizedWrapper.attributes().style).contains(expectedInitial)
    increaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expected)
  })

  it('should increase the height twice when clicking the arrow_upward twice', () => {
    const wrapper = mount(ResizableContainer, {localVue})
    const increaseHeightButton = wrapper.find({ref: 'increaseHeightButton'})
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const initialHeight = wrapper.props().initialHeight
    const stepSize = wrapper.props().stepSize
    const expectedInitial = heightString(initialHeight)
    const expectedOnce = heightString(initialHeight + stepSize)
    const expectedTwice = heightString(initialHeight + (stepSize * 2))

    expect(resizedWrapper.attributes().style).contains(expectedInitial)
    increaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedOnce)
    increaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedTwice)
  })

  it('does not decrease the height when it only has the initial height', () => {
    const wrapper = mount(ResizableContainer, {localVue})
    const decreaseHeightButton = wrapper.find({ref: 'decreaseHeightButton'})
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const initialHeight = wrapper.props().initialHeight
    const expected = heightString(initialHeight)

    expect(resizedWrapper.attributes().style).contains(expected)
    decreaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expected)
  })

  it('decreases the height when the height is above initial height', () => {
    const wrapper = mount(ResizableContainer, {localVue})
    const increaseHeightButton = wrapper.find({ref: 'increaseHeightButton'})
    const decreaseHeightButton = wrapper.find({ref: 'decreaseHeightButton'})
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const initialHeight = wrapper.props().initialHeight
    const stepSize = wrapper.props().stepSize
    const expectedInitial = heightString(initialHeight)
    const expectedIncreased = heightString(initialHeight + stepSize)

    expect(resizedWrapper.attributes().style).contains(expectedInitial)
    increaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedIncreased)
    decreaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedInitial)
  })

  it('does not decrease the height below the initial height', () => {
    const wrapper = mount(ResizableContainer, {localVue})
    const increaseHeightButton = wrapper.find({ref: 'increaseHeightButton'})
    const decreaseHeightButton = wrapper.find({ref: 'decreaseHeightButton'})
    const resizedWrapper = wrapper.find({ref: 'resizedWrapper'})

    const initialHeight = wrapper.props().initialHeight
    const stepSize = wrapper.props().stepSize
    const expectedInitial = heightString(initialHeight)
    const expectedIncreased = heightString(initialHeight + stepSize)

    expect(resizedWrapper.attributes().style).contains(expectedInitial)
    increaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedIncreased)
    decreaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedInitial)
    decreaseHeightButton.trigger('click')
    expect(resizedWrapper.attributes().style).contains(expectedInitial)
  })
})

function heightString (height) {
  return `height: ${height}px;`
}
