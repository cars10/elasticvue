import createPersistedState from 'vuex-persistedstate'
import { LOCALSTORAGE_KEY } from '@/consts'

export const plugins = [
  createPersistedState({
    key: LOCALSTORAGE_KEY,
    paths: [
      'codeEditor',
      'connection.instances',
      'theme',
      'queryRest',
      'indices',
      'language',
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
