export const theme = {
  namespaced: true,
  state: {
    dark: true
  },
  mutations: {
    setDark (state, dark) {
      state.dark = dark
    }
  }
}
