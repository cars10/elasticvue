import store from '@/store'

export const openModal = function (options) {
  store.commit('modal/setModalOpen', true)
  store.commit('modal/setMethod', options.method)
  store.commit('modal/setMethodParams', options.methodParams)
  store.commit('modal/setTitle', options.title)
  store.commit('modal/setSubtitle', options.subtitle)
}
