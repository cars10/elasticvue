import Vue from 'vue'
import Vuex from 'vuex'
import CodeEditor from '@/components/shared/CodeEditor'
import { createLocalVue, mount } from '@vue/test-utils'
import { theme } from '@/store/modules/theme'
import '../../mocks/codeEditorMocks'
import Vuetify from 'vuetify'

describe('components/shared/CodeEditor.vue', () => {
  let localVue
  let vuetify
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    vuetify = new Vuetify()
    Vue.use(Vuetify)
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: { theme }
    })
  })

  describe('snapshots', () => {
    it('renders when empty', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false
        }
      })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders string value', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false,
          value: 'test'
        }
      })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('renders object value', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false,
          value: { a: 'test' }
        }
      })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('changes its value', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false,
          value: { a: 'test' }
        }
      })
      wrapper.setProps({ value: 'test2' })
      expect(wrapper.element).toMatchSnapshot()
    })

    it('removes itself from the dom on destroy', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false
        },
        attachToDocument: true
      })
      expect(wrapper.element.parentElement).toBeTruthy()
      wrapper.destroy()
      wrapper.vm.$nextTick(() => {
        expect(wrapper.element.parentElement).toBeFalsy()
      })
    })
  })

  describe('theme handling', () => {
    it('uses the correct default theme', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false
        }
      })
      expect(wrapper.vm.editor.getTheme()).toEqual('ace/theme/monokai')
    })

    it('changes the editor theme correctly', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false
        }
      })
      const vm = wrapper.vm
      expect(vm.editor.getTheme()).toEqual('ace/theme/monokai')

      vm.$store.commit('theme/setDark', false)
      expect(vm.editor.getTheme()).toEqual('ace/theme/textmate')

      vm.$store.commit('theme/setDark', true)
      expect(vm.editor.getTheme()).toEqual('ace/theme/monokai')
    })
  })

  describe('wrapLines', () => {
    it('does not wrap lines by default', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false
        }
      })
      expect(wrapper.vm.editor.getSession().getUseWrapMode()).toBeFalsy()
    })

    it('changes wrapLines setting', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          useWorker: false
        }
      })
      wrapper.setData({ settings: [1] })
      expect(wrapper.vm.editor.getSession().getUseWrapMode()).toBeTruthy()
    })
  })

  describe('readonly editor', () => {
    it('correctly sets the editor to readonly', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          readOnly: true,
          useWorker: false
        }
      })

      expect(wrapper.vm.editor.getReadOnly()).toBeTruthy()
    })

    it('updates the value when readonly', () => {
      const wrapper = mount(CodeEditor, {
        localVue,
        vuetify,
        store,
        propsData: {
          readOnly: true,
          useWorker: false
        }
      })

      wrapper.setProps({ value: 'test' })
      expect(wrapper.vm.editor.getReadOnly()).toBeTruthy()
    })
  })
})
