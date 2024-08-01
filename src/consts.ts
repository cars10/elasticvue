export const VERSION_NAME = 'stable'
export const SUPPORTED_MAJOR_VERSIONS = ['6', '7', '8']
export const REQUEST_DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

export const SUPPORTED_COUNTRY_LOCALES: Record<string, ValidLocale> = {
  en: 'en',
  cn: 'cn',
  zh: 'cn',
  fr: 'fr'
}
export type ValidLocale = 'en' | 'cn' | 'fr'
export const DEFAULT_LOCALE: ValidLocale = 'en'

export const DEFAULT_ROWS_PER_PAGE = [10, 20, 100, 0]
export const DEFAULT_HIDE_INDICES_REGEX = '^\\..*'
export const DEFAULT_HIDE_NODE_ATTRIBUTES_REGEX = '^(ml|xpack|transform)\\.'
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

export const DISTRIBUTIONS = {
  elasticsearch: 'elasticsearch',
  opensearch: 'opensearch'
}

export const REST_QUERY_EXAMPLES = [
  {
    description: 'Returns high-level information about indices in a cluster',
    method: 'GET',
    path: '_cat/indices',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-indices.html'
  },
  {
    description: 'Retrieves the cluster’s index aliases, including filter and routing information',
    method: 'GET',
    path: '_cat/aliases',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-aliases.html'
  },
  {
    description: 'The shards command is the detailed view of what nodes contain which shards',
    method: 'GET',
    path: '_cat/shards',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cat-shards.html'
  },
  {
    description: 'Performs multiple indexing or delete operations in a single API call',
    method: 'POST',
    path: '_bulk',
    body: '{ "index" : { "_index" : "test", "_id" : "1" } }\n' +
        '{ "field1" : "value1" }\n' +
        '{ "delete" : { "_index" : "test", "_id" : "2" } }\n' +
        '{ "create" : { "_index" : "test", "_id" : "3" } }\n' +
        '{ "field1" : "value3" }\n' +
        '{ "update" : {"_id" : "1", "_index" : "test"} }\n' +
        '{ "doc" : {"field2" : "value2"} }\n' +
        '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/docs-bulk.html'
  },
  {
    description: 'Create an API key with 1d expiration',
    method: 'POST',
    path: '_security/api_key',
    body: '{"name": "my-api-key","expiration": "1d"}',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-create-api-key.html'
  },
  {
    description: 'Flush all indices to disk',
    method: 'POST',
    path: '_flush',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-flush.html'
  },
  {
    description: 'Reloads the keystore on nodes in the cluster.',
    method: 'POST',
    path: '_nodes/reload_secure_settings',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/cluster-nodes-reload-secure-settings.html'
  },
  {
    description: 'Create a simple index named "example_test_index"',
    method: 'PUT',
    path: 'example_test_index',
    body: '{"settings": {"index": {"number_of_shards": 2,"number_of_replicas": 1}}}',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-create-index.html'
  },
  {
    description: 'Set all indices to writable',
    method: 'PUT',
    path: '_all/settings',
    body: '{"index": {"blocks": {"read_only_allow_delete": "false" } } }',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/index-modules-blocks.html'
  },
  {
    description: 'Delete an index named "example_test_index".',
    method: 'DELETE',
    path: 'example_test_index',
    body: '',
    doc: 'https://www.elastic.co/guide/en/elasticsearch/reference/current/indices-delete-index.html'
  }
]