import { defineStore } from 'pinia'
import { DEFAULT_DOCUMENT_FIELD_MAX_LENGTH, DEFAULT_PAGINATION } from '../consts'
import { useConnectionStore } from './connection'
import { toRaw } from 'vue'
import { rememberColumns, targetKey } from '../helpers/search/columns.ts'
import { sameSearch, SEARCH_HISTORY_LIMIT } from '../helpers/search/searchLibrary.ts'
import { clusterDb } from '../db/Idb.ts'
import type { IdbSearchEntry } from '../db/types.ts'
import type { SearchFilter, SearchMode, SearchTimeBounds } from '../types/search.ts'
import type { ReloadIntervalStorePartial } from './shared.ts'

type SearchPagination = typeof DEFAULT_PAGINATION

type SearchState = {
  targets: string[]
  mode: SearchMode
  q: string
  filters: SearchFilter[]
  dslBody: string
  sqlQuery: string
  esqlQuery: string
  history: IdbSearchEntry[]
  savedSearches: IdbSearchEntry[]
  libraryLoaded: boolean
  exactTotal: boolean
  columnsByTarget: Record<string, string[]>
  timeRange: SearchTimeBounds | null
  timeFieldByTarget: Record<string, string>
  histogramCollapsed: boolean
  sourceOnlyVisible: boolean
  pagination: SearchPagination
  localizeTimestamp: boolean
  stickyTableHeader: boolean
  rowsPerPageAccepted: boolean
  documentFieldMaxLength: number
} & ReloadIntervalStorePartial

export const useSearchStore = () => {
  const clusterUuid = useConnectionStore().activeCluster?.uuid || ''

  return defineStore(`search-${clusterUuid}`, {
    state: (): SearchState => ({
      targets: ['*'],
      mode: 'query',
      q: '*',
      filters: [],
      dslBody: '',
      sqlQuery: '',
      esqlQuery: '',
      history: [],
      savedSearches: [],
      libraryLoaded: false,
      exactTotal: false,
      columnsByTarget: {},
      timeRange: null,
      timeFieldByTarget: {},
      histogramCollapsed: false,
      sourceOnlyVisible: false,
      reloadInterval: null,
      pagination: { ...DEFAULT_PAGINATION },
      localizeTimestamp: true,
      stickyTableHeader: false,
      rowsPerPageAccepted: false,
      documentFieldMaxLength: DEFAULT_DOCUMENT_FIELD_MAX_LENGTH
    }),
    getters: {
      savedColumns: (state): string[] | undefined => state.columnsByTarget[targetKey(state.targets)],
      savedTimeField: (state): string | undefined => state.timeFieldByTarget[targetKey(state.targets)]
    },
    actions: {
      setColumns(columns: string[]) {
        this.columnsByTarget = rememberColumns(this.columnsByTarget, targetKey(this.targets), columns)
      },
      setTimeField(field: string) {
        this.timeFieldByTarget = rememberColumns(this.timeFieldByTarget, targetKey(this.targets), field)
      },
      resetColumns() {
        const key = targetKey(this.targets)
        this.columnsByTarget = Object.fromEntries(Object.entries(this.columnsByTarget).filter(([k]) => k !== key))
      },
      resetPage() {
        this.pagination.page = 1
        this.exactTotal = false
      },
      async loadLibrary() {
        if (this.libraryLoaded) return
        const { searchHistory, savedSearches } = clusterDb(clusterUuid)
        const [history, saved] = await Promise.all([searchHistory.getAll(), savedSearches.getAll()])
        this.history = history
        this.savedSearches = saved
        this.libraryLoaded = true
      },
      async addHistory(entry: IdbSearchEntry) {
        await this.loadLibrary()
        if (sameSearch(this.history[this.history.length - 1], entry)) return

        this.history.push(entry)
        const removed = this.history.splice(0, Math.max(0, this.history.length - SEARCH_HISTORY_LIMIT))
        const { searchHistory } = clusterDb(clusterUuid)
        await Promise.all(removed.map((old) => searchHistory.remove(old.id)))
        entry.id = await searchHistory.insert(entry)
      },
      async removeHistory(id?: number) {
        this.history = this.history.filter((entry) => entry.id !== id)
        await clusterDb(clusterUuid).searchHistory.remove(id)
      },
      async clearHistory() {
        this.history = []
        await clusterDb(clusterUuid).searchHistory.clear()
      },
      async saveSearch(entry: IdbSearchEntry, name: string) {
        const { id: _id, ...rest } = toRaw(entry)
        const saved: IdbSearchEntry = { ...structuredClone(rest), name }
        saved.id = await clusterDb(clusterUuid).savedSearches.insert(saved)
        this.savedSearches.push(saved)
      },
      async renameSearch(id: number | undefined, name: string) {
        const saved = this.savedSearches.find((entry) => entry.id === id)
        if (!saved) return
        saved.name = name
        await clusterDb(clusterUuid).savedSearches.update(structuredClone(toRaw(saved)))
      },
      async removeSaved(id?: number) {
        this.savedSearches = this.savedSearches.filter((entry) => entry.id !== id)
        await clusterDb(clusterUuid).savedSearches.remove(id)
      },
      showIndex(index: string, q = '*') {
        this.targets = index.split(',').map((target) => target.trim())
        this.mode = 'query'
        this.q = q
        this.filters = []
        this.pagination = { ...DEFAULT_PAGINATION, rowsPerPage: this.pagination.rowsPerPage }
      }
    },
    persist: {
      pick: [
        'targets',
        'mode',
        'q',
        'filters',
        'dslBody',
        'sqlQuery',
        'esqlQuery',
        'columnsByTarget',
        'timeRange',
        'timeFieldByTarget',
        'histogramCollapsed',
        'sourceOnlyVisible',
        'reloadInterval',
        'pagination.sortBy',
        'pagination.descending',
        'pagination.rowsPerPage',
        'localizeTimestamp',
        'stickyTableHeader',
        'rowsPerPageAccepted',
        'documentFieldMaxLength'
      ],
      key: `search-${clusterUuid}`
    }
  })()
}
