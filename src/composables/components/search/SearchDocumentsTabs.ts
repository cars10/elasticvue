import { Ref, ref } from 'vue'
import { DEFAULT_PAGINATION, DEFAULT_SEARCH_QUERY } from '../../../consts.ts'
import { SearchState, useSearchStore } from '../../../store/search.ts'

export const usesearchDocumentsFormTabs = () => {
  const tabs = ref([] as SearchState[])

  const activeTabName: Ref<string | null> = ref(null)
  
  const searchStore = useSearchStore()
  
  const addTab = async () => {
    const newTab :SearchState = {
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

  const updateTab = (name: string, tab: SearchState) => {
    const existingTab = tabs.value.find(t => t.name === name)
    if (!existingTab) return
    Object.assign(existingTab, tab)
  }

  const removeTab = async (index: number) => {
    if (index < 0 || index >= tabs.value.length) return

    if (tabs.value[index].name === activeTabName.value && tabs.value[0]) {
      activeTabName.value = tabs.value[0].name
    }

    tabs.value.splice(index, 1)
  }

  const loadTabs = async () => {
    tabs.value = searchStore.tabs

    if (!activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
    if (tabs.value.length === 0) await addTab()
  }
  loadTabs()

  const activeTabIndex = () => (tabs.value.findIndex(t => t.name === activeTabName.value) || 0)

  
  return {
    tabs,
    activeTabIndex,
    activeTabName,
    addTab,
    updateTab,
    removeTab
  }
}
