export const codeEditor = {
  namespaced: true,
  state: {
    useSpaces: false,
    wrapLines: false
  },
  mutations: {
    setUseSpaces (state, useSpaces) {
      state.useSpaces = useSpaces
    },
    setWrapLines (state, wrapLines) {
      state.wrapLines = wrapLines
    }
  }
}
