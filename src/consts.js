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

/**
 * Some defaults used for initial setup.
 */
export const DEFAULT_NAME = 'default cluster'
export const DEFAULT_HOST = 'http://localhost:9200'
export const LOCALSTORAGE_KEY = 'elasticvuex'
export const DEFAULT_SEARCH_QUERY = '{\n\t"query": {\n\t\t"query_string": {\n\t\t\t"query": "*"\n\t\t}\n\t},\n\t"size": 10,\n\t"from": 0,\n\t"sort": []\n}'

export const REQUEST_DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

export const DEFAULT_ITEMS_PER_PAGE = [10, 20, 100, { text: 'All', value: -1 }]
export const DEFAULT_DATA_TABLE_OPTIONS = {
  page: 1,
  itemsPerPage: DEFAULT_ITEMS_PER_PAGE[0],
  sortBy: [],
  sortByDesc: []
}

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
export const BASE_URI = process.env.VUE_APP_ROUTER_MODE ? 'index.html' : '/'
export const DEFAULT_ELASTICSEARCH_HOST = {
  name: DEFAULT_NAME,
  username: '',
  password: '',
  uri: DEFAULT_HOST,
  status: CONNECTION_STATES.UNKNOWN
}

export const SHOW_CORS_HINT = process.env.VUE_APP_DISABLE_CORS_HINT !== 'true'
