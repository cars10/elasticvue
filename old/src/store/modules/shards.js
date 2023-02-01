export const shards = {
  namespaced: true,
  state: {
    filter: '',
    showHiddenIndices: false
  },
  mutations: {
    setFilter (state, filter) {
      state.filter = filter
    },
    setShowHiddenIndices (state, showHiddenIndices) {
      state.showHiddenIndices = showHiddenIndices
    }
  }
}
