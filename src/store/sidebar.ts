import { defineStore } from 'pinia'

type SidebarState = {
  collapsed: boolean
}

export const useSidebarStore = defineStore('sidebar', {
  state: (): SidebarState => ({
    collapsed: false
  }),
  actions: {
    toggleCollapsed() {
      this.collapsed = !this.collapsed
    }
  },
  persist: true
})
