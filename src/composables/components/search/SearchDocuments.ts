import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { useSearchStore } from '../../../store/search'
import { useResizeStore } from '../../../store/resize'
import { Ref, ref, watch } from 'vue'
import { removeComments } from '../../../services/json/parse'
import { DEFAULT_SEARCH_QUERY } from '../../../consts'

type Response = {
  hits: ResponseHits
}

type ResponseHits = {
  total: ResponseHitsValue
}

type ResponseHitsValue = {
  value: number
}

export const useSearchDocuments = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const searchStore = useSearchStore()
  const resizeStore = useResizeStore()

  const searchResults: Ref<Response> = ref({ hits: { total: { value: 0 } } })
  const queryParsingError = ref(false)
  const search = async () => {
    let query
    try {
      queryParsingError.value = false
      query = JSON.parse(removeComments(searchStore.searchQuery))
    } catch (e) {
      queryParsingError.value = true
      return
    }

    try {
      searchResults.value = await callElasticsearch('search', query, searchStore.indices)
      searchStore.pagination.rowsNumber = searchResults.value.hits?.total?.value
    } catch (e) {
      console.error(e)
      searchResults.value = { hits: { total: { value: 0 } } }
    }
  }

  watch(() => (searchStore.q), value => {
    mergeQuery({ query: { query_string: { query: value } } })
  })

  // pagination = {sortBy: '', descending: false, page: 2, rowsPerPage: 10, rowsNumber: 2593}
  const onRequest = ({ pagination }: any) => {
    searchStore.pagination.page = pagination.page
    searchStore.pagination.rowsPerPage = pagination.rowsPerPage
    searchStore.pagination.sortBy = pagination.sortBy
    searchStore.pagination.descending = pagination.descending

    const query = JSON.parse(removeComments(searchStore.searchQuery))
    Object.assign(query, buildQueryFromTableOptions(pagination))
    searchStore.searchQuery = JSON.stringify(query)
    search()
  }

  const mergeQuery = (params: any) => {
    const json = Object.assign({}, JSON.parse(DEFAULT_SEARCH_QUERY), params)
    searchStore.searchQuery = JSON.stringify(json, null, '\t')
  }

  return {
    search,
    searchResults,
    searchStore,
    resizeStore,
    queryParsingError,
    requestState,
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
    if (sort !== '_score') sortOptions[sort].unmapped_type = 'keyword'
    // @ts-ignore
    newQueryParts.sort = [sortOptions]
  }

  return newQueryParts
}
