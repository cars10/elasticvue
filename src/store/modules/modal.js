export const modal = {
  namespaced: true,
  state: {
    modalOpen: false,
    method: '',
    methodParams: {},
    title: '',
    subtitle: ''
  },
  mutations: {
    setModalOpen (state, open) {
      state.modalOpen = open
    },
    setMethod (state, method) {
      state.method = method
    },
    setMethodParams (state, methodParams) {
      state.methodParams = methodParams
    },
    setTitle (state, title) {
      state.title = title
    },
    setSubtitle (state, subtitle) {
      state.subtitle = subtitle
    }
  }
}
