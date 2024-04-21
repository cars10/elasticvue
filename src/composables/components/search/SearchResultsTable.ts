import { computed, Ref, ref, watch } from 'vue'
import { useResizeStore } from '../../../store/resize.js'
import { useSearchStore } from '../../../store/search.ts'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSelectableRows } from '../../SelectableRow.ts'
import SearchResults from '../../../models/SearchResults.ts'
import { sortableField } from '../../../helpers/search.ts'
import { EsSearchResult } from './SearchDocuments.ts'
import { ElasticsearchDocumentInfo } from './EditDocument.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'

export type SearchResultsTableProps = {
  results: EsSearchResult
}

export const useSearchResultsTable = (props: SearchResultsTableProps, emit: any) => {
  const resizeStore = useResizeStore()
  const searchStore = useSearchStore()

  const hits: Ref<any[]> = ref([])
  const filter = ref('')
  const tableColumns: Ref<any[]> = ref([])

  const { callElasticsearch } = useElasticsearchAdapter()

  const { selectedItems, allItemsSelected, setIndeterminate } = useSelectableRows(hits)
  const checkAll = (val: boolean) => {
    if (val) {
      selectedItems.value = hits.value.map(genDocStr)
    } else {
      selectedItems.value = []
    }
  }
  const reload = () => {
    checkAll(false)
    setIndeterminate()
    emit('reload')
  }

  const genDocStr = (doc: ElasticsearchDocumentInfo) => ([doc._index, doc._type, doc._id].join('####'))

  watch(() => searchStore.pagination.rowsPerPage, () => {
    if (searchStore.pagination.rowsPerPage === rowsPerPage[rowsPerPage.length - 1].value) {
      searchStore.stickyTableHeader = true
    }
    onRequest({ pagination: searchStore.pagination })
  })

  watch(() => props.results, async (newValue: EsSearchResult) => {
    if (newValue?.hits?.hits?.length === 0) {
      hits.value = []
      return
    }

    const results = new SearchResults(newValue?.hits?.hits)
    const indices = await callElasticsearch('indexGet', { index: results.uniqueIndices })
    const allProperties: Record<string, any> = {}

    Object.keys(indices).forEach(index => {
      const mappings = indices[index].mappings
      if (typeof mappings.properties === 'undefined') {
        // ES < 7
        const indexProperties = {}
        Object.keys(mappings).forEach(mapping => {
          Object.assign(indexProperties, mappings[mapping].properties)
        })
        Object.assign(allProperties, indexProperties)
      } else {
        // ES >= 7
        Object.assign(allProperties, mappings.properties)
      }
    })

    tableColumns.value = results.uniqueColumns.map(field => {
      const filterableCol = sortableField(field, allProperties[field])

      return { label: field, field, name: filterableCol || field, sortable: !!filterableCol, align: 'left' }
    })
    tableColumns.value.push({ label: '', name: 'actions' })

    const oldColumns = searchStore.columns
    searchStore.columns = tableColumns.value.map(c => c.name)
    const newColumns = searchStore.columns.filter(m => !oldColumns.includes(m))
    searchStore.visibleColumns = searchStore.visibleColumns.concat(newColumns)

    hits.value = results.docs
  })

  const filteredHits = computed(() => {
    if (filter.value.trim().length === 0) return hits.value

    return filterItems(hits.value, filter.value, tableColumns.value.map(c => c.field))
  })

  const slicedTableColumns = computed((): any[] => (tableColumns.value.slice(0, -1)))

  const onRequest = (pagination: any) => (emit('request', pagination))
  const clearColumns = () => (searchStore.visibleColumns = ['actions'])
  const resetColumns = () => (searchStore.visibleColumns = tableColumns.value.map(c => c.name))
  const generateDownloadData = () => (stringifyJson(props.results))

  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: searchStore.rowsPerPageAccepted, needsConfirm: true }
  ]

  const acceptRowsPerPage = (value: boolean) => (searchStore.rowsPerPageAccepted = value)

  return {
    acceptRowsPerPage,
    filter,
    tableColumns,
    searchStore,
    clearColumns,
    resetColumns,
    slicedTableColumns,
    resizeStore,
    hits,
    filteredHits,
    rowsPerPage,
    onRequest,
    reload,
    selectedItems,
    genDocStr,
    setIndeterminate,
    allItemsSelected,
    checkAll,
    generateDownloadData
  }
}