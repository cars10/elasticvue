export const survey = {
  namespaced: true,
  state: {
    hintVisible: true
  },
  mutations: {
    setHintVisible (state, visible) {
      state.hintVisible = visible
    }
  }
}
