export const DESKTOP_BUILD = false
export const SHOW_CORS_HINT = true
export const REQUEST_DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

export const SUPPORTED_COUNTRY_LOCALES: Record<string, string> = {
  en: 'en',
  cn: 'cn',
  zh: 'cn'
}
export const DEFAULT_LOCALE = 'en'
export const fetchMethod = fetch

export const DEFAULT_ROWS_PER_PAGE = [10, 20, 100, 0]
export const DEFAULT_HIDE_INDICES_REGEX = '^\\..*'
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
export const buildDefaultRequest = () => ({
  method: HTTP_METHODS[1],
  path: '',
  body: ''
})

export const DEFAULT_SEARCH_QUERY = '{\n\t"query": {\n\t\t"query_string": {\n\t\t\t"query": "*"\n\t\t}\n\t},\n\t"size": 10,\n\t"from": 0,\n\t"sort": []\n}'
export const DEFAULT_SEARCH_RESULT_COLUMNS = ['_index', '_type', '_id', '_score']
export const DEFAULT_SORTABLE_COLUMNS = ['_index', '_type', '_score']
export const DEFAULT_PAGINATION = {
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: -1
}