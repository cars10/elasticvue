import { defineStore } from 'pinia'

export const useResizeStore = defineStore('resize', {
  state: () => ({
    indicesTable: 500,
    modalLoaderCodeViewer: 600,
    restForm: 400
  }),
  persist: true
})
