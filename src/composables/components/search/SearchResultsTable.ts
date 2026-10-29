import { computed, ref, watch } from 'vue'
import { useResizeStore } from '../../../store/resize.ts'
import { useSearchStore } from '../../../store/search.ts'
import { useSelectableRows } from '../../SelectableRow.ts'
import { useTranslation } from '../../i18n.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { flattenDocument, formatFieldValue, getFieldValue, hasOwn, toCsv } from '../../../helpers/search/documentValues.ts'
import { columnOptions, defaultColumns, SOURCE_COLUMN } from '../../../helpers/search/columns.ts'
import type { FieldCatalog } from '../../../types/search.ts'
import type { EsSearchHit, EsSearchResult } from './SearchDocuments.ts'

export type SearchResultsTableProps = {
  results: EsSearchResult
  catalog: FieldCatalog
  catalogSkipped: boolean
  majorVersion: number
  loading: boolean
}

export const hitSource = (hit: EsSearchHit) => hit._source ?? hit.fields ?? {}
export const rawCellValue = (hit: EsSearchHit, column: string) => {
  if (column === SOURCE_COLUMN) return formatFieldValue(hitSource(hit))
  if (column === '_type') return hit._type || '_doc'
  if (column.startsWith('_') && hasOwn(hit, column)) return formatFieldValue(hit[column as keyof EsSearchHit])
  return formatFieldValue(getFieldValue(hitSource(hit), column))
}

export const hitKey = (hit: EsSearchHit) => [hit._index, hit._type || '_doc', hit._id].join('####')

export const useSearchResultsTable = (props: SearchResultsTableProps, emit: any) => {
  const t = useTranslation()
  const searchStore = useSearchStore()
  const resizeStore = useResizeStore()
  const activeTab = ref('hits')

  const hits = computed(() => props.results.hits?.hits || [])
  const { selectedItems, allItemsSelected, setIndeterminate } = useSelectableRows(computed(() => hits.value.map(hitKey)))

  const checkAll = (value: boolean) => (selectedItems.value = value ? hits.value.map(hitKey) : [])
  const reload = () => {
    checkAll(false)
    setIndeterminate()
    emit('reload')
  }

  const seenFields = computed(() => [...new Set(hits.value.flatMap((hit) => Object.keys(flattenDocument(hitSource(hit)))))])
  const options = computed(() => columnOptions(props.catalog, seenFields.value, props.majorVersion))
  const columns = computed(() => searchStore.savedColumns ?? defaultColumns(seenFields.value))

  const isSortable = (name: string) => {
    if (name === SOURCE_COLUMN) return false
    if (name === '_id') return props.majorVersion > 0 && props.majorVersion < 8 && props.majorVersion !== 5
    if (name.startsWith('_')) return true
    return !!props.catalog[name]?.sortField
  }

  const tableColumns = computed(() => [
    ...columns.value.map((name) => ({
      name,
      field: name,
      label: name === SOURCE_COLUMN ? t('search.results_table.document') : name,
      align: 'left' as const,
      sortable: isSortable(name)
    })),
    { name: 'actions', field: 'actions', label: '', align: 'right' as const }
  ])

  const rowsPerPage = computed(() => [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: searchStore.rowsPerPageAccepted, needsConfirm: true }
  ])

  const onRowsPerPageSelect = (value: number) => {
    if (value === 1000) searchStore.stickyTableHeader = true
    emit('request', { pagination: { ...searchStore.pagination, page: 1, rowsPerPage: value } })
  }
  const acceptRowsPerPage = (value: boolean) => (searchStore.rowsPerPageAccepted = value)

  const hasAggregations = computed(() => Object.keys(props.results.aggregations || {}).length > 0)
  const aggregationsJson = computed(() => (hasAggregations.value ? stringifyJson(props.results.aggregations ?? {}, null, 2) : ''))
  watch(hasAggregations, (has) => {
    if (!has) activeTab.value = 'hits'
  })

  const generateDownloadData = () => stringifyJson(props.results)
  const generateCsv = () => toCsv([columns.value, ...hits.value.map((hit) => columns.value.map((c) => rawCellValue(hit, c)))])

  return {
    searchStore,
    resizeStore,
    activeTab,
    hits,
    options,
    columns,
    tableColumns,
    selectedItems,
    allItemsSelected,
    setIndeterminate,
    checkAll,
    reload,
    rowsPerPage,
    onRowsPerPageSelect,
    acceptRowsPerPage,
    hasAggregations,
    aggregationsJson,
    generateDownloadData,
    generateCsv
  }
}
