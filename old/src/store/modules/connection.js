export const connection = {
  namespaced: true,
  state: {
    activeInstanceIdx: null,
    instances: [],
    elasticsearchAdapter: null
  },
  mutations: {
    setElasticsearchAdapter (state, adapter) {
      state.elasticsearchAdapter = adapter
    },
    addElasticsearchInstance (state, instance) {
      state.instances.push(instance)
    },
    renameElasticsearchInstance (state, { name, index }) {
      const instance = state.instances[index]
      if (instance) instance.name = name
    },
    removeInstance (state, index) {
      state.instances.splice(index, 1)
      if (state.instances.length === 0) {
        state.activeInstanceIdx = null
      } else if (index === state.activeInstanceIdx) {
        state.activeInstanceIdx = 0
      } else if (index < state.activeInstanceIdx) {
        state.activeInstanceIdx = state.activeInstanceIdx - 1
      }
    },
    setActiveInstanceIdx (state, index) {
      state.activeInstanceIdx = index
      state.elasticsearchAdapter = null
    }
  },
  getters: {
    activeInstance: state => {
      return state.instances[state.activeInstanceIdx]
    }
  }
}
