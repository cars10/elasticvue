import { defineStore } from 'pinia'

type RestState = {
  activeTabIndex: number
}

export const useRestStore = defineStore('rest', {
  state: (): RestState => ({
    activeTabIndex: 0
  }),
  persist: {
    pick: ['activeTabIndex']
  }
})
