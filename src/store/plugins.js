import createPersistedState from 'vuex-persistedstate'
import { LOCALSTORAGE_KEY } from '@/consts'

export const plugins = [
  createPersistedState({
    key: LOCALSTORAGE_KEY,
    paths: [
      'connection.instances',
      'codeEditor',
      'theme',
      'language',
      'queryRest',
      'indices',
      'nodes',
      'repositories',
      'snapshots',
      'search',
      'shards'
    ]
  }),
  createPersistedState({
    storage: window.sessionStorage,
    key: LOCALSTORAGE_KEY,
    paths: [
      'connection.activeInstanceIdx'
    ]
  })
]
