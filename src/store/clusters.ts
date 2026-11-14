import { defineStore } from 'pinia'
import { ReloadIntervalStorePartial } from './shared'

export const useClustersStore = defineStore('clusters', {
  state: (): ReloadIntervalStorePartial => ({
    reloadInterval: 30
  }),
  persist: true
})
