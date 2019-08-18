import Vue from 'vue'
import Vuetify from 'vuetify'
import Timer from '@/components/shared/Timer'
import { createLocalVue, mount } from '@vue/test-utils'
import '../../mocks/vuetifyMocks'

jest.useFakeTimers()

describe('components/shared/Timer.vue', () => {
  let localVue
  let vuetify

  beforeEach(() => {
    localVue = createLocalVue()
    vuetify = new Vuetify({
      mocks: {
        $vuetify: {
          t: v => v
        }
      }
    })
    Vue.use(Vuetify)
  })

  describe('snapshots', () => {
    it('should render correct default contents', () => {
      const wrapper = mount(Timer, { localVue, vuetify })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('shows the selected setting', () => {
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { defaultSetting: 5 } })
      expect(wrapper.element).toMatchSnapshot()
    })
  })

  describe('action calls', () => {
    it('does not call the action immediately if no defaultSetting is provided', () => {
      const myAction = jest.fn()
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { action: myAction } })

      wrapper.vm.$nextTick(() => {
        expect(myAction).toHaveBeenCalledTimes(0)
      })
    })

    it('calls the action immediately if a defaultSetting is provided', () => {
      const myAction = jest.fn()
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { defaultSetting: 5, action: myAction } })

      wrapper.vm.$nextTick(() => {
        expect(myAction).toHaveBeenCalledTimes(1)
      })
    })

    it('does not call the action periodically if no defaultSetting is provided', () => {
      const myAction = jest.fn()
      const seconds = 5
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { action: myAction } })

      wrapper.vm.$nextTick(() => {
        jest.advanceTimersByTime(seconds * 1000)
        expect(myAction).toHaveBeenCalledTimes(0)
      })
    })

    it('calls the action periodically if a defaultSetting is provided', () => {
      const myAction = jest.fn()
      const seconds = 5
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { defaultSetting: seconds, action: myAction } })

      wrapper.vm.$nextTick(() => {
        jest.advanceTimersByTime(seconds * 1000)
        expect(myAction).toHaveBeenCalledTimes(2)
      })
    })
  })

  describe('interval management', () => {
    it('starts the interval when a defaultSetting is passed', () => {
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { defaultSetting: 5 } })
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.intervalID).toBeTruthy()
      })
    })

    it('stops the interval when no time is selected', () => {
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { defaultSetting: 5 } })
      wrapper.vm.$nextTick(() => {
        expect(wrapper.vm.intervalID).toBeTruthy()
        wrapper.setData({ timerSetting: null })
        expect(wrapper.vm.intervalID).toBeFalsy()
      })
    })

    it('clears the interval when timer is destroyed', () => {
      const wrapper = mount(Timer, { localVue, vuetify, propsData: { defaultSetting: 5 } })
      wrapper.vm.$nextTick(() => {
        wrapper.destroy()
        expect(wrapper.vm.intervalID).toBeFalsy()
      })
    })
  })
})
