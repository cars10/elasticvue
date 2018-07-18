// import Vuetify from 'vuetify'
// import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
// import { createLocalVue, mount } from '@vue/test-utils'
//
// function addElemWithDataAppToBody () {
//   const app = document.createElement('div')
//   app.setAttribute('data-app', 'true')
//   document.body.append(app)
// }
//
// describe('components/shared/CustomVAutocomplete.vue', () => {
//   let localVue
//
//   before(() => {
//     addElemWithDataAppToBody()
//     localVue = createLocalVue()
//     localVue.use(Vuetify)
//   })
//
//   describe('all empty cases', () => {
//     it('returns empty array when called without props', () => {
//       const wrapper = mount(CustomVAutocomplete, {
//         localVue: localVue
//       })
//       wrapper.find('input').setValue('asd')
//
//       expect(wrapper.vm.items).to.eql([])
//     })
//   })
// })
