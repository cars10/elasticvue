export const VERSION_NAME = 'beta-6'
export const SUPPORTED_MAJOR_VERSIONS = ['6', '7', '8']
export const REQUEST_DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

export const SUPPORTED_COUNTRY_LOCALES: Record<string, ValidLocale> = {
  en: 'en',
  cn: 'cn',
  zh: 'cn'
}
export type ValidLocale = 'en' | 'cn'
export const DEFAULT_LOCALE: ValidLocale = 'en'

export const DEFAULT_ROWS_PER_PAGE = [10, 20, 100, 0]
export const DEFAULT_HIDE_INDICES_REGEX = '^\\..*'
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export const DEFAULT_SEARCH_QUERY_OBJ = { query: { query_string: { query: '*' } }, size: 10, from: 0, sort: [] }
export const DEFAULT_SEARCH_QUERY = JSON.stringify(DEFAULT_SEARCH_QUERY_OBJ)
export const DEFAULT_SEARCH_RESULT_COLUMNS = ['_index', '_type', '_id', '_score']
export const DEFAULT_SORTABLE_COLUMNS = ['_index', '_type', '_id', '_score']
export const DEFAULT_PAGINATION = {
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: -1
}

export const DEFAULT_CLUSTER_NAME = 'default cluster'
export const DEFAULT_CLUSTER_URI = 'http://localhost:9200'

export const REST_QUERY_EXAMPLES = [
  {
    description: 'Get health status of a cluster',
    method: 'GET',
    path: '_cluster/health',
    body: '',
    doc: ''
  },
  {
    description: 'Explain allocation',
    method: 'GET',
    path: '_cluster/allocation/explain',
    body: '',
    doc: ''
  },
  {
    description: 'Get cluster settings',
    method: 'GET',
    path: '_cluster/settings?include_defaults',
    body: '',
    doc: ''
  },
  {
    description: 'Clean all cache',
    method: 'POST',
    path: '_cache/clear',
    body: '',
    doc: ''
  },
  {
    description: 'Retry changing the allocation of shards',
    method: 'POST',
    path: '_cluster/reroute?retry_failed=true',
    body: '',
    doc: ''
  },
  {
    description: 'Get memory usage',
    method: 'GET',
    path: '_cat/nodes?h=name,heapCurrent,fielddataMemory,queryCacheMemory,requestCacheMemory,segmentsMemory&v',
    body: '',
    doc: ''
  },
  {
    description: 'Get fieldata memory usage of each index',
    method: 'GET',
    path: '_stats/fieldata?fields=*',
    body: '',
    doc: ''
  },
  {
    description: 'Get JVM usage',
    method: 'GET',
    path: '_nodes/stats/jvm?human',
    body: '',
    doc: ''
  },
  {
    description: 'Returns high-level information about indices in a cluster',
    method: 'GET',
    path: '_cat/indices',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-indices.html'
  },
  {
    description: 'Disallow replica shard allocation',
    method: 'PUT',
    path: '_cluster/settings',
    body: '{"persistent": {"cluster.routing.allocation.enable": "primaries" } }',
    doc: ''

  },
  {
    description: 'Flush all indices to disk',
    method: 'POST',
    path: '_flush',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-flush.html'
  },
  {
    description: 'Set all indices to writable',
    method: 'PUT',
    path: '_all/settings',
    body: '{"index": {"blocks": {"read_only_allow_delete": "false" } } }',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-blocks.html'
  }
]
