import { computed, Ref, ref, watch } from 'vue'
import { useResizeStore } from '../../../store/resize.js'
import { ColumnSort, SearchState, useSearchStore } from '../../../store/search.ts'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSelectableRows } from '../../SelectableRow.ts'
import SearchResults from '../../../models/SearchResults.ts'
import { sortableField } from '../../../helpers/search.ts'
import { EsSearchResult } from './SearchDocumentsForm.ts'
import { ElasticsearchDocumentInfo } from './EditDocument.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { useConnectionStore } from '../../../store/connection.ts'
import { DEFAULT_SEARCH_RESULT_COLUMNS } from '../../../consts.ts'

export type SearchResultsTableProps = {
  tab:SearchState
  results: EsSearchResult
}

export const useSearchResultsTable = (props: SearchResultsTableProps, emit: any) => {
  const COL_ACTION ='xxxx_action'
  const resizeStore = useResizeStore()
  const searchStore = useSearchStore()

  const ownTab: Ref<SearchState> = ref(props.tab)
  
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

  const genDocStr = (doc: ElasticsearchDocumentInfo) => [doc._index, doc._type, doc._id].join('####')

  watch(() => props.tab.pagination.rowsPerPage, () => {
    if (props.tab.pagination.rowsPerPage === rowsPerPage[rowsPerPage.length - 1].value) {
      props.tab.stickyTableHeader = true
    }
    onRequest( { pagination: props.tab.pagination })
  })

  const connectionStore = useConnectionStore()
  
  watch(() => props.results, async (newValue: EsSearchResult) => {
   

    const results = new SearchResults(newValue?.hits?.hits)
    const indices = await callElasticsearch('indexGet', { index: props.tab.indices })
    const allProperties: Record<string, any> = {}

    Object.keys(indices).forEach(index => {
      const mappings = indices[index].mappings
      if (mappings !==undefined) {
        if (connectionStore.activeCluster?.majorVersion.split('.')[0] !== undefined
        && +connectionStore.activeCluster?.majorVersion.split('.')[0] < 7)
        {
        //if (mappings.properties === undefined) {
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
      }
    })
    const temp = [...DEFAULT_SEARCH_RESULT_COLUMNS.slice(),...Object.keys(allProperties).map(f=> f)]

    tableColumns.value = temp.map(field => {
      const filterableCol = sortableField(field, allProperties[field])

      return { label: field, field, name: filterableCol || field, sortableCol: !!filterableCol, align: 'left' }
    })
    tableColumns.value.push({ label: '', name: COL_ACTION })

    const oldColumns = props.tab.columns
    const newColumnsList = tableColumns.value.map(c => c.name)
    const addedColumns = newColumnsList.filter(c => !oldColumns.includes(c))
    const removedColumns = oldColumns.filter(c => !newColumnsList.includes(c))

    props.tab.columns = newColumnsList
    
    if (props.tab.pagination.columnOrder.length === 0) {
      props.tab.pagination.columnOrder = newColumnsList.sort()
    } else {
      const existingOrder = props.tab.pagination.columnOrder.filter((col:any) => newColumnsList.includes(col))
      const newOrder = addedColumns.filter(col => !existingOrder.includes(col))
      props.tab.pagination.columnOrder = [...existingOrder, ...newOrder]
    }
    
    const updatedVisibleColumns = props.tab.visibleColumns.filter(c => !removedColumns.includes(c)).concat(addedColumns)
    props.tab.visibleColumns = updatedVisibleColumns.sort((a, b) => {
      const indexA = props.tab.pagination.columnOrder.indexOf(a)
      const indexB = props.tab.pagination.columnOrder.indexOf(b)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })

    hits.value = results.docs
  }, { deep: true, immediate: true, flush: 'post' })

  const filteredHits = computed(() => {
    let result = hits.value
    
    if (props.tab.filter.trim().length > 0) {
      result = filterItems(result, props.tab.filter, tableColumns.value.map(c => c.field))
    }
    
    return result
  })

  const sortColumnsByOrder = (columns: any[]) => {
    return [...columns].sort((a, b) => {
      const indexA = props.tab.pagination.columnOrder.indexOf(a.name)
      const indexB = props.tab.pagination.columnOrder.indexOf(b.name)
      
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
    return [...props.tab.visibleColumns].sort((a, b) => {
      const indexA = props.tab.pagination.columnOrder.indexOf(a)
      const indexB = props.tab.pagination.columnOrder.indexOf(b)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })
  })

  const onRequest = (pagination: any) => (emit('request',{ pagination}))
  const clearColumns = () => {
    props.tab.visibleColumns = [COL_ACTION]
  }
  
  const resetColumns = () => {
    const allColumns = tableColumns.value.map(c => c.name)
    props.tab.visibleColumns = allColumns.sort((a, b) => {
      const indexA = props.tab.pagination.columnOrder.indexOf(a)
      const indexB = props.tab.pagination.columnOrder.indexOf(b)
      
      if (indexA === -1) return 1
      if (indexB === -1) return -1
      
      return indexA - indexB
    })
  }
  const generateDownloadData = () => (stringifyJson(props.results))

  const updateColumnOrder = (newOrder: string[]) => {
    props.tab.pagination.columnOrder = newOrder
  }

  const resetColumnOrder = () => {
    
    props.tab.pagination.columnOrder = tableColumns.value.map(c => c.name).sort()    
  }

  const toggleColumnSort = (tabName:string, column: string) => {
    searchStore.toggleColumnSort(tabName,column)
  }

  const clearAllSorts = (tabName: string) => {
    searchStore.clearAllSorts(tabName)
  }

  const getColumnSortOrder = (column: string) => {
    const sort: ColumnSort | undefined = props.tab.pagination.columnSorts.find((s: ColumnSort) => s.column === column)
    return sort ? sort.order : null
  }

  const getColumnSortPriority = (column: string) => {
    const sort = props.tab.pagination.columnSorts.find((s:ColumnSort) => s.column === column)
    return sort ? sort.priority : null
  }

  const hasActiveSorts = computed(() => props.tab.pagination.columnSorts.length > 0)

  const onDropColumn = ( oldIndex: number, newIndex: number ) => {
    if (newIndex > 0 && newIndex < props.tab.pagination.columnOrder.length)
    {
      const temp = orderedVisibleColumns.value

      const oldColName = temp[oldIndex-1]
      const newColName = temp[newIndex-1]

      const realoldIndex = props.tab.pagination.columnOrder.indexOf(oldColName)
      const realnewIndex = props.tab.pagination.columnOrder.indexOf(newColName)

      const newOrder = [...props.tab.pagination.columnOrder]
      const [movedColumn] = newOrder.splice(realoldIndex, 1)
      newOrder.splice(realnewIndex, 0, movedColumn)
      updateColumnOrder(newOrder)
    }
  }

  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: props.tab.rowsPerPageAccepted, needsConfirm: true }
  ]

  const filterStateProps = setupFilterState(hits, filteredHits)

  const acceptRowsPerPage = (value: boolean) => (props.tab.rowsPerPageAccepted = value)

  return {
    ownTab,
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
    hasActiveSorts,
    onDropColumn
  }
}
