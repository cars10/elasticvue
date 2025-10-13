import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useResizeStore } from '../../../store/resize.ts'
import {  reactive, Ref, ref, watch } from 'vue'
import { parseJson } from '../../../helpers/json/parse.ts'
import {  DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY, DEFAULT_SEARCH_QUERY_OBJ } from '../../../consts.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { SearchState } from '../../../store/search.ts'

type SearchDocumentormProps = {
  tab: SearchState
}

export type EsSearchResult = {
  took: number | null
  hits: EsSearchResultHits
}

type EsSearchResultHits = {
  total: EsSearchResultsHitsValues | number,
  hits?: any
}

type EsSearchResultsHitsValues = {
  value: number
}

export const useSearchDocumentsForm = (props:SearchDocumentormProps) => {
  //const searchStore = useSearchStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  
  const resizeStore = useResizeStore()
  
  const ownTab = reactive(props.tab)
  
  const searchHistory = ref(ownTab.searchHistory || [])
  watch(searchHistory, value => {
    ownTab.searchHistory = value
  })


  const searchResults: Ref<EsSearchResult> = ref(ownTab.searchResults || { took: null, hits: { total: { value: 0 }, hits: [] } })
  watch(searchResults, value => {
    ownTab.searchResults = value
  })
  const queryParsingError = ref(false)
  const search = async () => {
    let query
    try {
      queryParsingError.value = false
      query = parseJson(ownTab.searchQuery)
    } catch (_e) {
      queryParsingError.value = true
      return
    }

    try {
      searchResults.value = await callElasticsearch('search', query, ownTab.indices)
      const total = searchResults.value.hits?.total
      ownTab.pagination.rowsNumber = typeof total === 'number' ? total : total.value
    } catch  {
      searchResults.value = { took: null, hits: { total: { value: 0 }, hits: [] } } 
    }
  }

  watch(() => (ownTab.indices), newIndices => {
    ownTab.pagination.columnSorts = []
    ownTab.columns = []
    ownTab.visibleColumns = []
    ownTab.pagination.columnOrder = []
    try {
      mergeQuery(Object.assign({}, parseJson(ownTab.searchQuery), { sort: [] }))
    } catch (e) {
      console.error(e)
    }

    if (Array.isArray(newIndices) && newIndices.length > 0) {
      ownTab.label = newIndices.join(', ')
    } else if (typeof newIndices === 'string' && newIndices) {
      ownTab.label = newIndices
    }
  })

  watch(() => (ownTab.q), value => {
    mergeQuery({ query: { query_string: { query: value } } })
  })

  watch(() => ownTab.pagination.columnSorts,
    () => {
      const query = parseJson(ownTab.searchQuery)
      Object.assign(query, buildQueryFromTableOptions(ownTab.pagination, ownTab.pagination.columnSorts))
      ownTab.searchQuery = stringifyJson(query)
      search()
    }, { deep: true })

  const onRequest = ({ pagination }: any) => {
    const paginationParam = pagination.pagination
    ownTab.pagination.page = paginationParam.page
    ownTab.pagination.rowsPerPage = paginationParam.rowsPerPage

    const query = parseJson(ownTab.searchQuery)
    Object.assign(query, buildQueryFromTableOptions(ownTab.pagination, ownTab.pagination.columnSorts))
    ownTab.searchQuery = stringifyJson(query)
    search()
  }

  const mergeQuery = (params: any) => {
    const json = Object.assign({}, DEFAULT_SEARCH_QUERY_OBJ, params)
    ownTab.searchQuery = stringifyJson(json, null, '\t')
  }

  const editorCommands = [
    {
      key: 'Ctrl-Enter', run: () => {
        search()
        return true
      }
    }
  ]

  const resetSearchQuery = () => {
    ownTab.q = '*'
    ownTab.searchQuery = DEFAULT_SEARCH_QUERY
    ownTab.pagination = Object.assign({}, DEFAULT_PAGINATION)
  }

  const addToHistory = (query: string) => {
    if (!query || query === '*') return
    
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }
    
    searchHistory.value.unshift(query)
    
    searchHistory.value = searchHistory.value.slice(0, 20)
  }

  if (ownTab.executeOnMount) {
    ownTab.executeOnMount = false
    search()
  }

  return {
    search,
    searchResults,
    ownTab,
    resizeStore,
    queryParsingError,
    requestState,
    editorCommands,
    onRequest,
    resetSearchQuery,
    searchHistory,
    addToHistory
  }
}

export const buildQueryFromTableOptions = (pagination: any, columnSorts: any[] = []) => {
  if (!pagination) return {}

  const from = (pagination.page - 1) * pagination.rowsPerPage
  const size = pagination.rowsPerPage
  const sort: any[] = []
  const newQueryParts = { size, from,sort }

  const sortArray = []
  
  if (columnSorts && columnSorts.length > 0) {
    const sortedColumnSorts = [...columnSorts].sort((a, b) => a.priority - b.priority)
    
    for (const sort of sortedColumnSorts) {
      if (sort.order && sort.column) {
        const sortOptions = {}
        // @ts-expect-error any
        sortOptions[sort.column] = { order: sort.order }
        sortArray.push(sortOptions)
      }
    }
  }
  
  if (sortArray.length > 0) {
    newQueryParts.sort = sortArray
  } else {
    newQueryParts.sort = []
  }

  return newQueryParts
}
