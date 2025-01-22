import { defineStore } from 'pinia'

type ShardsState = {
  filter: string
}

export const useShardsStore = defineStore('shards', {
  state: (): ShardsState => ({
    filter: ''
  }),
  persist: {
    pick: [
      'filter'
    ]
  }
})
