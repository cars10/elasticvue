import { DEFAULT_ELASTICSEARCH_HOST } from '@/consts'

export const connection = {
  namespaced: true,
  state: {
    activeInstanceIdx: -1,
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
      if (index === state.activeInstanceIdx) {
        state.activeInstanceIdx = 0
      } else if (index < state.activeInstanceIdx) {
        state.activeInstanceIdx = state.activeInstanceIdx - 1
      }
      if (state.instances.length === 0) {
        state.instances.push(Object.assign({}, DEFAULT_ELASTICSEARCH_HOST))
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
