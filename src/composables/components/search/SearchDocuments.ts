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

  const searchResults: Ref<EsSearchResult> = ref({ took: null, hits: { total: { value: 0 } } })
  const queryParsingError = ref(false)
  const search = async () => {
    let query
    try {
      queryParsingError.value = false
      query = parseJson(searchStore.searchQuery)
    } catch (e) {
      queryParsingError.value = true
      return
    }

    try {
      searchResults.value = await callElasticsearch('search', query, searchStore.indices)
      const total = searchResults.value.hits?.total
      searchStore.pagination.rowsNumber = typeof total === 'number' ? total : total.value
    } catch (e) {
      console.error(e)
      searchResults.value = { took: null, hits: { total: { value: 0 } } }
    }
  }

  watch(() => (searchStore.indices), () => {
    searchStore.pagination.sortBy = ''
    mergeQuery({sort: []})
  })

  watch(() => (searchStore.q), value => {
    mergeQuery({ query: { query_string: { query: value } } })
  })

  // pagination = {sortBy: '', descending: false, page: 2, rowsPerPage: 10, rowsNumber: 2593}
  const onRequest = ({ pagination }: any) => {
    searchStore.pagination.page = pagination.page
    searchStore.pagination.sortBy = pagination.sortBy
    searchStore.pagination.descending = pagination.descending

    const query = parseJson(searchStore.searchQuery)
    Object.assign(query, buildQueryFromTableOptions(pagination))
    searchStore.searchQuery = stringifyJson(query)
    search()
  }

  const mergeQuery = (params: any) => {
    const json = Object.assign({}, DEFAULT_SEARCH_QUERY_OBJ, params)
    searchStore.searchQuery = stringifyJson(json, null, '\t')
  }

  const editorCommands = [{
    key: 'Ctrl-Enter', run: () => {
      search()
      return true
    }
  }]

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

export const buildQueryFromTableOptions = (pagination: any) => {
  if (!pagination) return {}

  const from = (pagination.page - 1) * pagination.rowsPerPage
  const size = pagination.rowsPerPage
  const newQueryParts = { size, from, sort: [] }

  const order = pagination.descending ? 'desc' : 'asc'
  const sort: string = pagination.sortBy

  if (sort && order) {
    const sortOptions = {}
    // @ts-ignore
    sortOptions[sort] = { order }
    // @ts-ignore
    // if (sort !== '_score') sortOptions[sort].unmapped_type = 'keyword'
    // @ts-ignore
    newQueryParts.sort = [sortOptions]
  }

  return newQueryParts
}
