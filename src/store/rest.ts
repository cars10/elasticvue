import { defineStore } from 'pinia'
import { toRaw } from 'vue'
import { useConnectionStore } from './connection'
import { clusterDb } from '../db/Idb.ts'
import { debounce } from '../helpers/debounce.ts'
import {
  buildTab,
  emptyResponse,
  HISTORY_LIMIT,
  historyEntry,
  normalizeTab,
  pickRequest,
  RestTab,
  sameRequest
} from '../helpers/rest.ts'
import type { IdbRestQueryHistory, IdbRestQuerySavedQuery, IdbRestQueryTabRequest } from '../db/types.ts'

export type RestLibraryTab = 'history' | 'saved' | 'examples'

type RestState = {
  activeTabIndex: number
  libraryTab: RestLibraryTab
  loaded: boolean
  tabs: RestTab[]
  history: IdbRestQueryHistory[]
  savedQueries: IdbRestQuerySavedQuery[]
}

const tabSavers = new WeakMap<RestTab, () => void>()

export const useRestStore = () => {
  const clusterUuid = useConnectionStore().activeCluster?.uuid || ''
  const db = () => clusterDb(clusterUuid)

  return defineStore(`rest-${clusterUuid}`, {
    state: (): RestState => ({
      activeTabIndex: 0,
      libraryTab: 'history',
      loaded: false,
      tabs: [],
      history: [],
      savedQueries: []
    }),
    getters: {
      activeTab: (state): RestTab | undefined => state.tabs[state.activeTabIndex]
    },
    actions: {
      async load() {
        if (this.loaded) return

        const { restQueryTabs, restQueryResponses, restQueryHistory, restQuerySavedQueries } = db()
        const [tabs, responses, history, savedQueries] = await Promise.all([
          restQueryTabs.getAll(),
          restQueryResponses.getAll(),
          restQueryHistory.getAll(),
          restQuerySavedQueries.getAll()
        ])

        const responsesById = new Map(responses.map((response) => [response.id, response]))
        this.tabs = tabs.map((tab, index) => normalizeTab(tab, index, responsesById.get(tab.id!)))
        this.history = history
        this.savedQueries = savedQueries
        this.loaded = true

        tabs.forEach((tab, index) => {
          if (tab.response) this.saveTab(this.tabs[index], { withResponse: true })
        })

        if (this.tabs.length === 0) await this.addTab()
        if (!this.activeTab) this.activeTabIndex = 0
      },

      async addTab(request?: IdbRestQueryTabRequest) {
        const tab = buildTab(`Tab ${this.tabs.length + 1}`, request)
        const id = await db().restQueryTabs.insert(tab)
        this.tabs.push({ ...tab, id, response: emptyResponse() })
        this.activeTabIndex = this.tabs.length - 1
      },

      async removeTab(index: number) {
        const [tab] = this.tabs.splice(index, 1)
        if (index < this.activeTabIndex || (index === this.activeTabIndex && index > 0)) this.activeTabIndex--

        await Promise.all([db().restQueryTabs.remove(tab.id), db().restQueryResponses.remove(tab.id)])
      },

      renameTab(tab: RestTab, label: string) {
        tab.label = label
        this.saveTab(tab)
      },

      saveTab(tab: RestTab, { withResponse = false } = {}) {
        const raw = toRaw(tab)
        if (withResponse) db().restQueryResponses.update({ id: raw.id, ...raw.response })

        if (!tabSavers.has(raw)) {
          const save = () => db().restQueryTabs.update({ id: raw.id, label: raw.label, request: raw.request })
          tabSavers.set(raw, debounce(save, 200))
        }
        tabSavers.get(raw)!()
      },

      async openRequest(request: IdbRestQueryTabRequest, { newTab = false } = {}) {
        await this.load()
        if (newTab || !this.activeTab) return this.addTab(request)

        Object.assign(this.activeTab.request, pickRequest(request))
        this.activeTab.response = emptyResponse()
        this.saveTab(this.activeTab, { withResponse: true })
      },

      async addHistory(request: IdbRestQueryTabRequest) {
        const entry = historyEntry(request)
        if (sameRequest(this.history[this.history.length - 1], entry)) return

        const { restQueryHistory } = db()
        while (this.history.length >= HISTORY_LIMIT) await restQueryHistory.remove(this.history.shift()?.id)

        entry.id = await restQueryHistory.insert(entry)
        this.history.push(entry)
      },

      async removeHistory(id?: number) {
        this.history = this.history.filter((entry) => entry.id !== id)
        await db().restQueryHistory.remove(id)
      },

      async clearHistory() {
        this.history = []
        await db().restQueryHistory.clear()
      },

      async saveQuery(request: IdbRestQueryTabRequest, name: string) {
        const query: IdbRestQuerySavedQuery = { name, ...pickRequest(request) }
        query.id = await db().restQuerySavedQueries.insert(query)
        this.savedQueries.push(query)
      },

      async renameQuery(id: number | undefined, name: string) {
        const query = this.savedQueries.find((q) => q.id === id)
        if (!query) return

        query.name = name
        await db().restQuerySavedQueries.update(toRaw(query))
      },

      async removeQuery(id?: number) {
        this.savedQueries = this.savedQueries.filter((query) => query.id !== id)
        await db().restQuerySavedQueries.remove(id)
      }
    },
    persist: {
      pick: ['activeTabIndex', 'libraryTab'],
      key: `rest-${clusterUuid}`
    }
  })()
}
