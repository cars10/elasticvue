import { NORMALIZED_SEARCH_PARAMS } from '../../consts'

export const browse = {
  state: {
    results: [],
    search: Object.assign({}, NORMALIZED_SEARCH_PARAMS)
  },
  mutations: {
    setSearch (state, search) {
      state.search = search
    }
  }
}
