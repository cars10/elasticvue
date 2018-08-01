import Vuex from 'vuex'
import CodeEditor from '@/components/shared/CodeEditor'
import { createLocalVue, mount } from '@vue/test-utils'
import { theme } from '@/store/modules/theme'
import '../../mocks/codeEditorMocks'

describe('components/shared/CodeEditor.vue', () => {
  let localVue
  let store

  beforeEach(() => {
    localVue = createLocalVue()
    localVue.use(Vuex)
    store = new Vuex.Store({
      modules: {theme}
    })
  })

  it('renders when empty', () => {
    const wrapper = mount(CodeEditor, {
      localVue: localVue,
      store: store,
      propsData: {
        useWorker: false
      }
    })
    expect(wrapper.html()).not.toBeNull()
  })

  describe('theme handling', () => {
    it('uses the correct default theme', () => {
      const wrapper = mount(CodeEditor, {
        localVue: localVue,
        store: store,
        propsData: {
          useWorker: false
        }
      })
      const vm = wrapper.vm
      expect(vm.editor.getTheme()).toEqual('ace/theme/monokai')
    })

    it('changes the editor theme correctly', () => {
      const wrapper = mount(CodeEditor, {
        localVue: localVue,
        store: store,
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

  describe('readonly editor', () => {
    it('correctly sets the editor to readonly', () => {
      const wrapper = mount(CodeEditor, {
        localVue: localVue,
        store: store,
        propsData: {
          readOnly: true,
          useWorker: false
        }
      })

      const vm = wrapper.vm
      expect(vm.editor.getReadOnly()).toBeTruthy()
    })
  })

  describe('code handling', () => {
    // it('changes the code when typing', () => {
    //   let myCode = JSON.stringify({some: 'code'})
    //   const wrapper = mount(CodeEditor, {
    //     localVue: localVue,
    //     store: store,
    //     propsData: {
    //       'code.sync': myCode
    //     },
    //     attachToDocument: true
    //   })
    //
    //   // FIXME
    //   expect(wrapper.find('.ace_text-layer').html()).to.include(myCode)
    // })
  })

  describe('destroying', () => {
    it('destroys itself and the editor correctly', () => {
      const wrapper = mount(CodeEditor, {
        localVue: localVue,
        store: store,
        propsData: {
          useWorker: false
        }
      })
      expect(wrapper.destroy())
    })
  })
})
