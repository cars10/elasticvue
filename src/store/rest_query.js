import { defineStore } from 'pinia'
import { buildDefaultRequest, HTTP_METHODS } from '../consts'

export const useRestQueryStore = defineStore('restQuery', {
  state: () => {
    const defaultTabId = Date.now()

    return {
      activeTab: `tab-${defaultTabId}`,
      tabs: [generateTab(0)]
    }
  },
  actions: {
    addTab () {
      const tab = generateTab(this.tabs.length)
      this.tabs.push(tab)
      this.activeTab = tab.name
    },
    removeTab (index) {
      this.tabs.splice(index, 1)
    }
  },
  persist: true
})

const generateTab = length => {
  const id = Date.now()
  const num = length + 1
  const name = `tab-${id}`
  return {
    name,
    label: `Tab ${num}`,
    request: buildDefaultRequest()
  }
}