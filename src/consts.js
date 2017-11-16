export const ELASTICSEARCH_API_VERSIONS = [
  '6.0',
  '5.6',
  '5.5',
  '5.4',
  '5.3',
  '5.2',
  '5.1',
  '5.0'
]

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
export const DEFAULT_VERSION = ELASTICSEARCH_API_VERSIONS[0]

export const LOCALSTORAGE_KEY = 'elasticvue_vuex'
