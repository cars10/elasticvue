import { computed, Ref, ref, watch } from 'vue'
import { useTranslation } from '../../i18n'
import { useIndicesStore } from '../../../store/indices'
import { useResizeStore } from '../../../store/resize'
import { DEFAULT_ROWS_PER_PAGE } from '../../../consts'
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
  'store.size': string
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

  const rowsPerPage = computed(() => {
    if (indicesStore.stickyTableHeader) {
      return [0]
    } else {
      return DEFAULT_ROWS_PER_PAGE
    }
  })

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

  const { selectedItems, allItemsSelected, setIndeterminate } = useSelectableRows(items)

  const clearDeletedIndicesAndReload = () => {
    selectedItems.value = []
    setIndeterminate()
    emit('reload')
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
    { label: '' }
  ])

  return {
    indicesStore,
    resizeStore,
    items,
    tableKey,
    rowsPerPage,
    filterTable,
    selectedItems,
    allItemsSelected,
    setIndeterminate,
    clearDeletedIndicesAndReload,
    columns
  }
}