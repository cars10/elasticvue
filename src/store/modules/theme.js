export const theme = {
  namespaced: true,
  state: {
    dark: true
  },
  mutations: {
    setDark (state, flag) {
      state.dark = flag
    }
  }
}
