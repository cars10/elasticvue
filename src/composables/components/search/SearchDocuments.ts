import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { useSearchStore } from '../../../store/search'
import { useResizeStore } from '../../../store/resize'
import { Ref, ref, watch } from 'vue'
import { parseJson } from '../../../helpers/json/parse'
import { DEFAULT_SEARCH_QUERY_OBJ } from '../../../consts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'

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

export const useSearchDocuments = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const searchStore = useSearchStore()
  const resizeStore = useResizeStore()

  const searchResults: Ref<EsSearchResult> = ref({ took: null, hits: { total: { value: 0 }, hits: [] } })
  const queryParsingError = ref(false)
  const search = async () => {
    let query
    try {
      queryParsingError.value = false
      query = parseJson(searchStore.searchQuery)
    } catch (_e) {
      queryParsingError.value = true
      return
    }

    try {
      searchResults.value = await callElasticsearch('search', query, searchStore.indices)
      const total = searchResults.value.hits?.total
      searchStore.pagination.rowsNumber = typeof total === 'number' ? total : total.value
    } catch  {
      searchResults.value =  { took: null, hits: { total: { value: 0 }, hits: [] } }  
    }
  }

  watch(() => (searchStore.indices), () => {
    searchStore.pagination.columnSorts = []
    searchStore.columns = []
    searchStore.visibleColumns = []
    searchStore.pagination.columnOrder = []
    try {
      mergeQuery(Object.assign({}, parseJson(searchStore.searchQuery), { sort: [] }))
    } catch (e) {
      console.error(e)
    }
  })

  watch(() => (searchStore.q), value => {
    mergeQuery({ query: { query_string: { query: value } } })
  })
  
  watch(() => searchStore.pagination.columnSorts,
  () => {
      const query = parseJson(searchStore.searchQuery)
      Object.assign(query, buildQueryFromTableOptions(searchStore.pagination, searchStore.pagination.columnSorts))
      searchStore.searchQuery = stringifyJson(query)
      search()
  }, { deep: true })

  const onRequest = ( { pagination }: any) => {
    const paginationParam = pagination.pagination
    searchStore.pagination.page = paginationParam.page
    searchStore.pagination.rowsPerPage = paginationParam.rowsPerPage

    const query = parseJson(searchStore.searchQuery)
    Object.assign(query, buildQueryFromTableOptions(searchStore.pagination, searchStore.pagination.columnSorts))
    searchStore.searchQuery = stringifyJson(query)
    search()
  }

  const mergeQuery = (params: any) => {
    const json = Object.assign({}, DEFAULT_SEARCH_QUERY_OBJ, params)
    searchStore.searchQuery = stringifyJson(json, null, '\t')
  }

  const editorCommands = [
    {
      key: 'Ctrl-Enter', run: () => {
        search()
        return true
      }
    },
    {
      key: 'Cmd-Enter', run: () => {
        search()
        return true
      }
    }
  ]

  return {
    search,
    searchResults,
    searchStore,
    resizeStore,
    queryParsingError,
    requestState,
    editorCommands,
    onRequest
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
