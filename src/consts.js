export const CONNECTION_STATES = {
  UNKNOWN: 'unknown',
  SUCCESS: 'success',
  ERROR: 'error'
}

export const CONNECTION_STATE_NAMES = {}
CONNECTION_STATE_NAMES[CONNECTION_STATES.UNKNOWN] = 'unknown'
CONNECTION_STATE_NAMES[CONNECTION_STATES.SUCCESS] = 'connected'
CONNECTION_STATE_NAMES[CONNECTION_STATES.ERROR] = 'disconnected'

export const DEFAULT_HOST = 'http://localhost:9200'

export const LOCALSTORAGE_KEY = 'elasticvue_vuex'
