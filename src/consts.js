/**
 * Common constants that are used project-wide
 */

/**
 * Different states to distinguish current connection status, also displayed in navbar.
 * - UNKNOWN: initial state
 * - SUCCESS: set after successful connection
 * - ERROR:   set if any error happens
 * @type {{UNKNOWN: string, SUCCESS: string, ERROR: string}}
 */
export const CONNECTION_STATES = {
  UNKNOWN: 'unknown',
  SUCCESS: 'success',
  ERROR: 'error'
}

export const CONNECTION_STATE_NAMES = {}
CONNECTION_STATE_NAMES[CONNECTION_STATES.UNKNOWN] = 'unknown'
CONNECTION_STATE_NAMES[CONNECTION_STATES.SUCCESS] = 'connected'
CONNECTION_STATE_NAMES[CONNECTION_STATES.ERROR] = 'disconnected'

export const CONNECTION_STATE_CLASSES = {}
CONNECTION_STATE_CLASSES[CONNECTION_STATES.UNKNOWN] = ''
CONNECTION_STATE_CLASSES[CONNECTION_STATES.SUCCESS] = 'green'
CONNECTION_STATE_CLASSES[CONNECTION_STATES.ERROR] = 'red'

/**
 * Some defaults used for initial setup.
 */
export const DEFAULT_HOST = 'http://localhost:9200'
export const LOCALSTORAGE_KEY = 'elasticvuex'

/**
 * Supported elasticsearch versions.
 */
export const ELASTICSEARCH_API_VERSIONS = [
  '6.x',
  '6.0',
  '5.6',
  '5.5',
  '5.4',
  '5.3',
  '5.2',
  '5.1',
  '5.0',
  '2.4',
  '1.7',
  '0.90'
]

/**
 * Default search parameters for search and browse pages.
 * @type {{q: string, from: number, size: number, index: Array}}
 */
export const DEFAULT_SEARCH_PARAMS = {
  q: '*',
  from: 0,
  size: 1000,
  index: []
}
