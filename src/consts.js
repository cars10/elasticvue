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
export const INDEXEDDB_NAME = 'elasticvue'
export const DEFAULT_SEARCH_QUERY = '{\n\t"query": {\n\t\t"query_string": {\n\t\t\t"query": "*"\n\t\t}\n\t},\n\t"size": 10,\n\t"from": 0,\n\t"sort": []\n}'
export const DEFAULT_HIDE_INDICES_REGEX = '^\\..*'

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

export const IDB_TABLE_NAMES = {
  REST: 'rest',
  SEARCH: 'search'
}
export const IDB_TABLE_DEFINITIONS = {
  [IDB_TABLE_NAMES.REST]: {
    indexes: ['date'],
    filterableColumns: ['method', 'path', 'name']
  },
  [IDB_TABLE_NAMES.SEARCH]: {
    indexes: ['date'],
    filterableColumns: ['path', 'name']
  }
}
export const REST_QUERY_EXAMPLES = [
  {
    description: 'Returns high-level information about indices in a cluster.',
    method: 'GET',
    path: '_cat/indices',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-indices.html'
  },
  {
    description: 'Create a simple index named "example_test_index".',
    method: 'PUT',
    path: 'example_test_index',
    body: '{\r\n\t"settings": {\r\n\t\t"index": {\r\n\t\t\t"number_of_shards": 3,\r\n\t\t\t"number_of_replicas": 2\r\n\t\t}\r\n\t}\r\n}',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html'
  },
  {
    description: 'Delete a simple index named "example_test_index".',
    method: 'DELETE',
    path: 'example_test_index',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-index.html'
  }
]

/**
 * i18n
 */
export const SUPPORTED_COUNTRY_LOCALES = {
  en: 'en',
  cn: 'cn',
  zh: 'cn'
}
export const DEFAULT_LOCALE = 'en'
