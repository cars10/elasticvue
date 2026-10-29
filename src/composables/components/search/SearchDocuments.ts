import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { useSearchStore } from '../../../store/search'
import { useConnectionStore } from '../../../store/connection.ts'
import { useRestStore } from '../../../store/rest.ts'
import { useFieldCatalog } from './FieldCatalog.ts'
import { useSearchHistogram } from './SearchHistogram.ts'
import { useFieldValues } from './FieldValues.ts'
import { useSqlSearch } from './SqlSearch.ts'
import { sqlApi, sqlBody, defaultSqlQuery, type SqlMode } from '../../../helpers/search/sql.ts'
import { queryKeyFor, searchEntry } from '../../../helpers/search/searchLibrary.ts'
import type { IdbSearchEntry } from '../../../db/types.ts'
import { parseJson } from '../../../helpers/json/parse'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { askConfirm } from '../../../helpers/dialogs.ts'
import { writeToClipboard } from '../../../helpers/clipboard.ts'
import { buildSearchBody } from '../../../helpers/search/buildSearchBody.ts'
import { unmappedTypeFor } from '../../../helpers/search/fieldCatalog.ts'
import { SOURCE_COLUMN, targetKey } from '../../../helpers/search/columns.ts'
import { getFieldValue } from '../../../helpers/search/documentValues.ts'
import { parseFilters } from '../../../helpers/search/filters.ts'
import { hitSource } from './SearchResultsTable.ts'
import { buildQueryFromTableOptions, getTableOptionsToApply } from '../../../helpers/search/searchQueryTableOptions'
import { paginationFromQuery } from '../../../helpers/search/paginationFromQuery'
import { useTranslation } from '../../i18n.ts'
import { elasticsearchCompatibleVersion, versionAtLeast } from '../../../helpers/minClusterVersion.ts'
import { allowedRowsPerPage } from '../../../consts.ts'
import { dateFields, timeFieldFor } from '../../../helpers/search/timeRange.ts'
import type { SearchFilter, SearchMode, SearchSort, SearchTimeBounds } from '../../../types/search.ts'

export type EsSearchHit = {
  _index: string
  _type?: string
  _id: string
  _score?: number | null
  _routing?: string
  _source?: Record<string, unknown>
  fields?: Record<string, unknown>
}

export type EsSearchResult = {
  took?: number
  hits: { total: { value: number; relation?: string } | number; hits: EsSearchHit[] }
  aggregations?: Record<string, unknown>
}

export type TablePagination = { sortBy: string; descending: boolean; page: number; rowsPerPage: number }

const emptyResult = (): EsSearchResult => ({ hits: { total: { value: 0 }, hits: [] } })

export const useSearchDocuments = () => {
  const t = useTranslation()
  const route = useRoute()
  const router = useRouter()
  const searchStore = useSearchStore()
  const connectionStore = useConnectionStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { catalog, skipped: catalogSkipped, load: loadCatalog } = useFieldCatalog()
  const { callElasticsearch: callTargets } = useElasticsearchAdapter()
  const matchedIndices = ref<number | null>(null)
  let latestTargets = 0
  let latestSearch = 0

  const histogram = useSearchHistogram()
  const sql = useSqlSearch()
  let suspendWatchers = false
  const compatibleVersion = computed(() =>
    elasticsearchCompatibleVersion(connectionStore.activeCluster?.version, connectionStore.elasticsearch)
  )
  const majorVersion = computed(() => parseInt(compatibleVersion.value) || 0)
  const isSqlMode = (mode: SearchMode): mode is SqlMode => mode === 'sql' || mode === 'esql'
  const sqlApiFor = (mode: SqlMode) => sqlApi(mode, connectionStore.activeCluster?.version || '', connectionStore.elasticsearch)
  const modes = computed(() =>
    (['query', 'dsl', 'sql', 'esql'] as SearchMode[]).filter((mode) => !isSqlMode(mode) || !!sqlApiFor(mode))
  )
  const sqlText = (mode: SqlMode) => (mode === 'sql' ? searchStore.sqlQuery : searchStore.esqlQuery)
  const { loadValues: loadFieldValues } = useFieldValues()
  const catalogFields = computed(() => Object.keys(catalog.value).sort())
  const loadValues = (field: string) => loadFieldValues(targetKey(searchStore.targets), field, catalog.value)
  const timeFields = computed(() => dateFields(catalog.value))
  const timeField = computed(() => timeFieldFor(catalog.value, searchStore.savedTimeField))
  const showHistogram = computed(() => searchStore.mode === 'query' && !!timeField.value)
  const results = shallowRef<EsSearchResult>(emptyResult())
  const openHit = shallowRef<EsSearchHit | null>(null)
  const queryParsingError = ref(false)
  let dslSeed = ''

  const searchPath = computed(() => `${targetKey(searchStore.targets)}/_search`)

  const sortFieldFor = (column: string) => (column.startsWith('_') ? column : catalog.value[column]?.sortField)

  const tableSort = (): SearchSort | null => {
    const field = sortFieldFor(searchStore.pagination.sortBy)
    if (!field) return null
    return {
      field,
      descending: searchStore.pagination.descending,
      unmappedType: versionAtLeast(compatibleVersion.value, '1.4')
        ? unmappedTypeFor(catalog.value[field], majorVersion.value)
        : undefined
    }
  }

  const sourceFilter = () => {
    const columns = searchStore.savedColumns
    if (!searchStore.sourceOnlyVisible || !columns || columns.includes(SOURCE_COLUMN)) return null
    const fields = columns.filter((column) => !column.startsWith('_'))
    return fields.length > 0 ? fields : false
  }

  const queryBody = () =>
    buildSearchBody({
      q: searchStore.q,
      filters: searchStore.filters,
      source: sourceFilter(),
      time: timeField.value && searchStore.timeRange ? { field: timeField.value, ...searchStore.timeRange } : null,
      sort: tableSort(),
      page: searchStore.pagination.page,
      size: searchStore.pagination.rowsPerPage,
      exactTotal: searchStore.exactTotal,
      majorVersion: majorVersion.value
    })

  const requestBody = (): Record<string, unknown> =>
    searchStore.mode === 'dsl' ? (parseJson(searchStore.dslBody || '{}') as Record<string, unknown>) : queryBody()

  const totalHits = computed(() => {
    const total = results.value.hits?.total
    if (typeof total === 'number') return { value: total, exact: true }
    return { value: total?.value ?? 0, exact: total?.relation !== 'gte' }
  })

  const urlQuery = () => ({
    index: targetKey(searchStore.targets),
    q: searchStore.q,
    ...(searchStore.timeRange && searchStore.timeRange),
    ...(searchStore.savedTimeField && { time_field: searchStore.savedTimeField }),
    ...(searchStore.filters.length > 0 && { filters: JSON.stringify(searchStore.filters) })
  })

  const syncUrl = () => {
    if (searchStore.mode === 'query') router.replace({ query: urlQuery() })
    else if (Object.keys(route.query).length > 0) router.replace({ query: {} })
  }

  const loadHistogram = () => {
    if (!showHistogram.value || searchStore.histogramCollapsed) return histogram.clear()
    histogram.load({
      index: targetKey(searchStore.targets),
      query: queryBody().query,
      field: timeField.value!,
      range: searchStore.timeRange,
      fixedInterval: versionAtLeast(compatibleVersion.value, '7.2')
    })
  }

  const search = async () => {
    const request = ++latestSearch
    const mode = searchStore.mode
    syncUrl()
    if (isSqlMode(mode)) {
      const api = sqlApiFor(mode)
      if (api) sql.run(api, mode, sqlText(mode))
      return
    }

    let body
    try {
      body = requestBody()
      queryParsingError.value = false
    } catch (_e) {
      queryParsingError.value = true
      return
    }

    if (searchStore.mode === 'dsl') {
      const { page, rowsPerPage } = paginationFromQuery(body, searchStore.pagination.rowsPerPage)
      Object.assign(searchStore.pagination, { page, rowsPerPage })
    }

    const result = await callElasticsearch('search', body, targetKey(searchStore.targets)).catch(emptyResult)
    if (request !== latestSearch) return
    results.value = result
    searchStore.pagination.rowsNumber = totalHits.value.value
  }

  const submit = () => {
    searchStore.resetPage()
    search()
    loadHistogram()
  }

  const currentEntry = () =>
    searchEntry({
      ...searchStore.$state,
      timeField: searchStore.savedTimeField,
      columns: searchStore.savedColumns
    })

  const submitSearch = () => {
    submit()
    const entry = currentEntry()
    if (entry) searchStore.addHistory(entry)
  }

  const refresh = () => {
    if (requestState.value.loading || document.activeElement?.closest('[data-testid=search-dsl]')) return
    search()
    loadHistogram()
  }

  const setTimeRange = (range: SearchTimeBounds | null) => {
    searchStore.timeRange = range
    if (range && timeField.value && !searchStore.pagination.sortBy) {
      Object.assign(searchStore.pagination, { sortBy: timeField.value, descending: true })
    }
    submit()
  }

  const setTimeField = (field: string) => {
    if (searchStore.pagination.sortBy === timeField.value) searchStore.pagination.sortBy = field
    searchStore.setTimeField(field)
    submit()
  }

  const addFilter = (filter: SearchFilter) => {
    searchStore.filters = [...searchStore.filters, filter]
  }

  const showSurrounding = (hit: EsSearchHit) => {
    const field = timeField.value
    const value = field ? getFieldValue(hitSource(hit), field) : undefined
    const time = new Date(typeof value === 'number' ? value : String(value)).getTime()
    if (!field || Number.isNaN(time)) return

    openHit.value = null
    searchStore.q = '*'
    Object.assign(searchStore.pagination, { sortBy: field, descending: true })
    setTimeRange({ from: new Date(time - 300_000).toISOString(), to: new Date(time + 300_000).toISOString() })
  }

  const toggleHistogram = () => {
    searchStore.histogramCollapsed = !searchStore.histogramCollapsed
    loadHistogram()
  }

  const onRequest = ({ pagination }: { pagination: TablePagination }) => {
    if (searchStore.mode === 'dsl') {
      const body = requestBody()
      const tableOptions = buildQueryFromTableOptions({ ...pagination, sortBy: sortFieldFor(pagination.sortBy || '') })
      const sortByChanged = pagination.sortBy !== searchStore.pagination.sortBy
      const toApply = sortByChanged ? tableOptions : getTableOptionsToApply(body, tableOptions, pagination)
      searchStore.dslBody = stringifyJson({ ...body, ...toApply }, null, '\t')
      Object.assign(searchStore.pagination, {
        sortBy: 'sort' in toApply ? pagination.sortBy : '',
        descending: 'sort' in toApply ? pagination.descending : false
      })
    } else {
      const { sortBy, descending, page, rowsPerPage } = pagination
      if (rowsPerPage !== searchStore.pagination.rowsPerPage || sortBy !== searchStore.pagination.sortBy) {
        searchStore.exactTotal = false
      }
      Object.assign(searchStore.pagination, { sortBy: sortBy || '', descending, page, rowsPerPage })
    }

    search()
  }

  const confirmLeavingDsl = async () =>
    searchStore.mode !== 'dsl' || searchStore.dslBody === dslSeed || (await askConfirm(t('search.form.mode.discard_dsl')))

  const setMode = async (mode: SearchMode) => {
    if (mode === searchStore.mode || !(await confirmLeavingDsl())) return

    const previous = searchStore.mode
    if (mode === 'dsl') {
      dslSeed = stringifyJson(queryBody(), null, '\t')
      searchStore.dslBody = dslSeed
    }
    if (isSqlMode(mode) && !sqlText(mode).trim()) {
      searchStore[queryKeyFor(mode)] = defaultSqlQuery(mode, searchStore.targets, connectionStore.elasticsearch)
    }
    if (previous === 'dsl') searchStore.pagination.rowsPerPage = allowedRowsPerPage(searchStore.pagination.rowsPerPage)
    if (mode === 'query' && previous === 'dsl') searchStore.pagination.sortBy = ''

    searchStore.mode = mode
    if (mode === 'dsl') syncUrl()
    else submit()
  }

  const applyEntry = async (entry: IdbSearchEntry) => {
    if (!(await confirmLeavingDsl())) return

    const targetsChanged = targetKey(entry.targets) !== targetKey(searchStore.targets)
    suspendWatchers = true
    searchStore.targets = [...entry.targets]
    searchStore.mode = modes.value.includes(entry.mode) ? entry.mode : 'query'
    searchStore[queryKeyFor(entry.mode)] = entry.query
    if (entry.mode === 'dsl') dslSeed = entry.query
    searchStore.filters = entry.filters.map((filter) => ({ ...filter }))
    searchStore.timeRange = entry.timeRange && { ...entry.timeRange }
    if (entry.timeField) searchStore.setTimeField(entry.timeField)
    if (entry.columns) searchStore.setColumns([...entry.columns])
    await nextTick()
    suspendWatchers = false

    if (!targetsChanged) return submit()
    searchStore.pagination.sortBy = ''
    searchStore.resetPage()
    searchTargets()
  }

  const countExactly = () => {
    searchStore.exactTotal = true
    search()
  }

  const restRequest = () => {
    const mode = searchStore.mode
    const api = isSqlMode(mode) ? sqlApiFor(mode) : null
    if (isSqlMode(mode) && api) return { path: `${api.path}?format=${api.format}`, body: sqlBody(api, mode, sqlText(mode)) }
    return { path: searchPath.value, body: requestBody() }
  }

  const openInRest = async () => {
    const { path, body } = restRequest()
    await useRestStore().openRequest({ method: 'POST', path, body: stringifyJson(body, null, 2) }, { newTab: true })
    router.push({ name: 'rest' })
  }

  const copyAsCurl = () => {
    const uri = (connectionStore.activeCluster?.uri || '').replace(/\/$/, '')
    const { path, body } = restRequest()
    const json = stringifyJson(body).replace(/'/g, String.raw`'\''`)
    writeToClipboard(`curl -X POST '${uri}/${path}' -H 'Content-Type: application/json' -d '${json}'`)
  }

  const loadTargets = async ({ force = false } = {}) => {
    const request = ++latestTargets
    const targets = searchStore.targets
    const count = await callTargets('catIndicesFor', { index: targetKey(targets), params: { h: 'index' } })
      .then((rows: unknown[]) => rows.length)
      .catch(() => null)
    if (request !== latestTargets) return

    matchedIndices.value = count
    await loadCatalog(targets, { force, matchedIndices: count ?? 0 })
  }

  const searchTargets = async () => {
    const loading = loadTargets()
    if (searchStore.timeRange) await loading
    search()
    await loading
    loadHistogram()
  }

  const hydrateFromUrl = () => {
    const { index, q, from, to, time_field, filters } = route.query
    if (typeof index !== 'string' || !index) return

    searchStore.showIndex(index, typeof q === 'string' ? q : undefined)
    searchStore.timeRange = typeof from === 'string' && typeof to === 'string' ? { from, to } : null
    if (typeof time_field === 'string' && time_field) searchStore.setTimeField(time_field)
    if (typeof filters === 'string') searchStore.filters = parseFilters(filters)
  }

  onMounted(() => {
    hydrateFromUrl()
    if (!modes.value.includes(searchStore.mode)) searchStore.mode = 'query'
    searchTargets()
    searchStore.loadLibrary()

    watch(
      () => targetKey(searchStore.targets),
      () => {
        if (suspendWatchers) return
        searchStore.pagination.sortBy = ''
        searchStore.resetPage()
        searchTargets()
      }
    )
    watch(
      () => searchStore.filters,
      () => !suspendWatchers && submit(),
      { deep: true }
    )
    watch(
      () => searchStore.sourceOnlyVisible && searchStore.savedColumns,
      () => !suspendWatchers && search()
    )
  })

  const editorCommands = ['Ctrl-Enter', 'Cmd-Enter'].map((key) => ({
    key,
    run: () => {
      submitSearch()
      return true
    }
  }))

  return {
    searchStore,
    modes,
    sql,
    results,
    openHit,
    catalog,
    catalogFields,
    loadValues,
    catalogSkipped,
    matchedIndices,
    majorVersion,
    timeFields,
    timeField,
    showHistogram,
    histogram,
    totalHits,
    requestState,
    queryParsingError,
    search,
    submit,
    submitSearch,
    currentEntry,
    applyEntry,
    refresh,
    setTimeRange,
    setTimeField,
    toggleHistogram,
    addFilter,
    showSurrounding,
    onRequest,
    setMode,
    countExactly,
    openInRest,
    copyAsCurl,
    editorCommands,
    reloadTargets: () => loadTargets({ force: true })
  }
}
