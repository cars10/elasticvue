import createPersistedState from 'vuex-persistedstate'
import { LOCALSTORAGE_KEY } from '../consts'

export const plugins = [
  createPersistedState({
    key: LOCALSTORAGE_KEY,
    paths: [
      'connection.wasConnected',
      'connection.elasticsearchHost',
      'theme',
      'query',
      'indices',
      'search.pagination',
      'search.stickyTableHeader'
    ]
  })
]
