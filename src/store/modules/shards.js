export const shards = {
  namespaced: true,
  state: {
    filter: '',
    showHiddenIndices: false,
    onlyUnhealthy: false
  },
  mutations: {
    setFilter (state, filter) {
      state.filter = filter
    },
    setShowHiddenIndices (state, showHiddenIndices) {
      state.showHiddenIndices = showHiddenIndices
    },
    setOnlyUnhealthy (state, onlyUnhealthy) {
      state.onlyUnhealthy = onlyUnhealthy
    }
  }
}
