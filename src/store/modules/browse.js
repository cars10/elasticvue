import Search from '../../models/elasticsearch/search'

export const browse = {
  state: {
    search: new Search({}),
    results: []
  },
  mutations: {
    setSearchQ (state, q) {
      state.search.q = q
      state.search.evaluate()
    },
    setSearchSize (state, size) {
      state.search.size = size
      state.search.evaluate()
    },
    setSearchFrom (state, from) {
      state.search.from = from
      state.search.evaluate()
    },
    setSearchIndex (state, index) {
      state.search.index = index
      state.search.evaluate()
    },
    setBrowseResults (state, results) {
      results.hits.hits = results.hits.hits.slice(0, 100)
      state.results = results
    }
  }
}
