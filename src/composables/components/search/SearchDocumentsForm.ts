import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSearchStore } from '../../../store/search.ts'
import { useResizeStore } from '../../../store/resize.ts'
import { nextTick, Ref, ref, toRaw, watch } from 'vue'
import { parseJson } from '../../../helpers/json/parse.ts'
import { DEFAULT_SEARCH_QUERY_OBJ } from '../../../consts.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { IdbSearchDocumentTab } from '../../../db/types.ts'
import { debounce } from 'quasar'
import { useIdbStore } from '../../../db/Idb.ts'

type SearchDocumentormProps = {
  tab: IdbSearchDocumentTab
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

  const { searchDocumentTabs  } = useIdbStore()

  const ownTab = ref(props.tab)
  let updateIdb = true

  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const searchStore = useSearchStore()
  const resizeStore = useResizeStore()

  searchStore.searchQuery = ownTab.value.query
  searchStore.searchQueryCollapsed = ownTab.value.searchQueryCollapsed

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
    searchStore.searchQuery = stringifyJson(json, null, '	')
  }

  watch(() => searchStore.searchQuery, value => {
    if (updateIdb) updateTab({ query: value })
  })

  watch(() => searchStore.searchQueryCollapsed, value => {
    if (updateIdb) updateTab({ searchQueryCollapsed: value })
  })

  watch(ownTab.value.request, value => {
    if (updateIdb) updateTab({ request: toRaw(value) })
  })
  watch(ownTab.value.response, value => {
    if (updateIdb) updateTab({ response: toRaw(value) })
  })
  const updateTab = debounce((value: object) => {
    const obj = Object.assign({}, toRaw(props.tab), value)
    searchDocumentTabs.update(obj)
  }, 100)

  watch(() => props.tab, newValue => {
    updateIdb = false
    ownTab.value.query = newValue.query
    ownTab.value.searchQueryCollapsed = newValue.searchQueryCollapsed
    ownTab.value.request.method = newValue.request.method
    ownTab.value.request.path = newValue.request.path
    ownTab.value.request.body = newValue.request.body

    searchStore.searchQuery = newValue.query
    searchStore.searchQueryCollapsed = newValue.searchQueryCollapsed

    nextTick(() => {
      updateIdb = true
    })
  })
    

  const editorCommands = [
    {
      key: 'Ctrl-Enter', run: () => {
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