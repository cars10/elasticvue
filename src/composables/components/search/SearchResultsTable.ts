import { computed, Ref, ref, watch } from 'vue'
import { useResizeStore } from '../../../store/resize.js'
import { ColumnSort, useSearchStore } from '../../../store/search.ts'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSelectableRows } from '../../SelectableRow.ts'
import SearchResults from '../../../models/SearchResults.ts'
import { sortableField } from '../../../helpers/search.ts'
import { EsSearchResult } from './SearchDocuments.ts'
import { ElasticsearchDocumentInfo } from './EditDocument.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { setupFilterState } from '../shared/FilterState.ts'

export type SearchResultsTableProps = {
  results: EsSearchResult
}

export const useSearchResultsTable = (props: SearchResultsTableProps, emit: any) => {
  const resizeStore = useResizeStore()
  const searchStore = useSearchStore()

  const hits: Ref<any[]> = ref([])
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

      return { label: field, field, name: filterableCol || field, sortableCol: !!filterableCol, align: 'left' }
    })
    tableColumns.value.push({ label: '', name: 'actions' })

    const oldColumns = searchStore.columns
    const newColumnsList = tableColumns.value.map(c => c.name)
    const addedColumns = newColumnsList.filter(c => !oldColumns.includes(c))
    const removedColumns = oldColumns.filter(c => !newColumnsList.includes(c))

    searchStore.columns = newColumnsList
    
    if (searchStore.pagination.columnOrder.length === 0) {
      searchStore.pagination.columnOrder = newColumnsList
    } else {
      const existingOrder = searchStore.pagination.columnOrder.filter((col:any) => newColumnsList.includes(col))
      const newOrder = addedColumns.filter(col => !existingOrder.includes(col))
      searchStore.pagination.columnOrder = [...existingOrder, ...newOrder]
    }
    
    const updatedVisibleColumns = searchStore.visibleColumns.filter(c => !removedColumns.includes(c)).concat(addedColumns)
    searchStore.visibleColumns = updatedVisibleColumns.sort((a, b) => {
      const indexA = searchStore.pagination.columnOrder.indexOf(a)
      const indexB = searchStore.pagination.columnOrder.indexOf(b)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })

    hits.value = results.docs
  })

  const filteredHits = computed(() => {
    let result = hits.value
    
    if (searchStore.filter.trim().length > 0) {
      result = filterItems(result, searchStore.filter, tableColumns.value.map(c => c.field))
    }
    
    return result
  })

  const sortColumnsByOrder = (columns: any[]) => {
    return columns.sort((a, b) => {
      const indexA = searchStore.pagination.columnOrder.indexOf(a.name)
      const indexB = searchStore.pagination.columnOrder.indexOf(b.name)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })
  }

  const slicedTableColumns = computed((): any[] => {
    return sortColumnsByOrder([...tableColumns.value.slice(0, -1)])
  })

  const orderedTableColumns = computed((): any[] => {
    return sortColumnsByOrder([...tableColumns.value])
  })

  const orderedVisibleColumns = computed((): string[] => {
    return searchStore.visibleColumns.sort((a, b) => {
      const indexA = searchStore.pagination.columnOrder.indexOf(a)
      const indexB = searchStore.pagination.columnOrder.indexOf(b)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })
  })

  const onRequest = (pagination: any) => (emit('request', pagination))
  const clearColumns = () => {
    searchStore.visibleColumns = ['actions']
  }
  
  const resetColumns = () => {
    const allColumns = tableColumns.value.map(c => c.name)
    searchStore.visibleColumns = allColumns.sort((a, b) => {
      const indexA = searchStore.pagination.columnOrder.indexOf(a)
      const indexB = searchStore.pagination.columnOrder.indexOf(b)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })
  }
  const generateDownloadData = () => (stringifyJson(props.results))

  const updateColumnOrder = (newOrder: string[]) => {
    searchStore.pagination.columnOrder = newOrder
  }

  const resetColumnOrder = () => {
    searchStore.pagination.columnOrder = tableColumns.value.map(c => c.name)
  }

  const toggleColumnSort = (column: string) => {
    searchStore.toggleColumnSort(column)
  }

  const clearAllSorts = () => {
    searchStore.clearAllSorts()
  }

  const getColumnSortOrder = (column: string) => {
    const sort: ColumnSort | undefined = searchStore.pagination.columnSorts.find((s: ColumnSort) => s.column === column)
    return sort ? sort.order : null
  }

  const getColumnSortPriority = (column: string) => {
    const sort = searchStore.pagination.columnSorts.find((s:ColumnSort) => s.column === column)
    return sort ? sort.priority : null
  }

  const hasActiveSorts = computed(() => searchStore.pagination.columnSorts.length > 0)

  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: searchStore.rowsPerPageAccepted, needsConfirm: true }
  ]

  const filterStateProps = setupFilterState(hits, filteredHits)

  const acceptRowsPerPage = (value: boolean) => (searchStore.rowsPerPageAccepted = value)

  return {
    acceptRowsPerPage,
    filterStateProps,
    tableColumns,
    orderedTableColumns,
    orderedVisibleColumns,
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
    generateDownloadData,
    updateColumnOrder,
    resetColumnOrder,
    toggleColumnSort,
    clearAllSorts,
    getColumnSortOrder,
    getColumnSortPriority,
    hasActiveSorts
  }
}