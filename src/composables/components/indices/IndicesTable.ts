import { Ref, ref, watch } from 'vue'
import { useTranslation } from '../../i18n'
import { useIndicesStore } from '../../../store/indices'
import { useResizeStore } from '../../../store/resize'
import { filterItems } from '../../../helpers/filters'
import ElasticsearchIndex from '../../../models/ElasticsearchIndex'
import { debounce } from '../../../helpers/debounce'
import { useSelectableRows } from '../../SelectableRow'
import { genColumns } from '../../../helpers/tableColumns'

export type EsIndex = {
  index: string,
  health: string,
  status: string,
  uuid: string,
  pri: string,
  rep: string,
  sc: string,
  'docs.count': string,
  'store.size': string,
  cd: string
}

export type EsTableProps = {
  indices: EsIndex[]
}

export const useIndicesTable = (props: EsTableProps, emit: any) => {
  const t = useTranslation()

  const indicesStore = useIndicesStore()
  const resizeStore = useResizeStore()

  const items: Ref<ElasticsearchIndex[]> = ref([])
  const tableKey = ref(0)

  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: indicesStore.rowsPerPageAccepted, needsConfirm: true }
  ]

  const filterTable = () => {
    let results = props.indices
    if (results.length === 0) return []
    if (!indicesStore.showHiddenIndices) {
      results = results.filter((item: any) => !item.index.match(new RegExp(indicesStore.hideIndicesRegex)))
    }

    results = filterItems(results, indicesStore.filter, ['index', 'uuid'])
    items.value = results.map((index: any) => new ElasticsearchIndex(index))
  }

  const debouncedFilterTable = debounce(filterTable, 150)
  watch(() => indicesStore.filter, debouncedFilterTable)
  watch(() => indicesStore.showHiddenIndices, filterTable)
  watch(() => props.indices, filterTable)
  watch(() => indicesStore.stickyTableHeader, () => (tableKey.value += 1))
  watch(() => indicesStore.pagination.rowsPerPage, () => {
    if (indicesStore.pagination.rowsPerPage === rowsPerPage[rowsPerPage.length - 1].value) {
      indicesStore.stickyTableHeader = true
    }
  })

  const { selectedItems, allItemsSelected, setIndeterminate } = useSelectableRows(items)

  const clearDeletedIndicesAndReload = () => {
    selectedItems.value = []
    setIndeterminate()
    emit('reload')
  }

  const acceptRowsPerPage = (value: boolean) => (indicesStore.rowsPerPageAccepted = value)

  const checkAll = (val: boolean) => {
    if (val) {
      selectedItems.value = items.value.map(i => i.index)
    } else {
      selectedItems.value = []
    }
  }

  const columns = genColumns([
    { label: t('indices.indices_table.table.headers.name'), field: 'index' },
    { label: t('indices.indices_table.table.headers.health'), field: 'health' },
    { label: t('indices.indices_table.table.headers.status'), field: 'status' },
    { label: t('indices.indices_table.table.headers.uuid'), field: 'uuid' },
    { label: t('indices.indices_table.table.headers.aliases') },
    { label: t('indices.indices_table.table.headers.shards'), field: 'parsedPri', align: 'right' },
    { label: t('indices.indices_table.table.headers.segments'), field: 'parsedSegmentsCount', align: 'right' },
    { label: t('indices.indices_table.table.headers.docs'), field: 'parsedDocsCount', align: 'right' },
    { label: t('indices.indices_table.table.headers.storage'), field: 'parsedStoreSize', align: 'right' },
    { label: t('indices.indices_table.table.headers.created'), field: 'created' },
    { label: '' }
  ])

  return {
    indicesStore,
    resizeStore,
    items,
    tableKey,
    rowsPerPage,
    acceptRowsPerPage,
    checkAll,
    filterTable,
    selectedItems,
    allItemsSelected,
    setIndeterminate,
    clearDeletedIndicesAndReload,
    columns
  }
}