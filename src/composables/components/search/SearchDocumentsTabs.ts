import { computed } from 'vue'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../../../consts.ts'
import { SearchState, useSearchStore } from '../../../store/search.ts'
import { storeToRefs } from 'pinia'

export const usesearchDocumentsFormTabs = () => {
  const searchStore = useSearchStore()
  const { tabs, activeTab: activeTabName } = storeToRefs(searchStore)

  if (tabs.value.length === 0) {
    addTab()
  }

  const activeTabIndex = computed(() => (tabs.value.findIndex(t => t.name === activeTabName.value) || 0))

  function addTab () {
    const newTab: SearchState = {
      name: `tab-doc-${Date.now()}`,
      label: `Tab ${tabs.value.length + 1}`,
      q: '*',
      filter: '',
      indices: '*',
      searchQuery: DEFAULT_SEARCH_QUERY,
      searchQueryCollapsed: false,
      columns: [],
      visibleColumns: [],
      columnOrder: [],
      stickyTableHeader: false,
      pagination: Object.assign({}, DEFAULT_PAGINATION),
      rowsPerPageAccepted: false,
      searchHistory: [],
      searchResults: null
    }
    tabs.value.push(newTab)
    activeTabName.value = newTab.name
  }

  function updateTab (name: string, tab: SearchState) {
    const existingTab = tabs.value.find(t => t.name === name)
    if (!existingTab) return
    Object.assign(existingTab, tab)
  }

  function removeTab (index: number) {
    if (index < 0 || index >= tabs.value.length) return

    if (tabs.value[index].name === activeTabName.value && tabs.value[0]) {
      activeTabName.value = tabs.value[0].name
    }

    tabs.value.splice(index, 1)
  }

  return {
    tabs,
    activeTabIndex,
    activeTabName,
    addTab,
    updateTab,
    removeTab
  }
}
