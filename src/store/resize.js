import { defineStore } from 'pinia'

export const useResizeStore = defineStore('resize', {
  state: () => ({
    indicesTable: 500,
    modalLoaderCodeViewer: 600,
    restForm: 400,
    searchQuery: 400,
    searchTable: 500,
    documentEdit: 500
  }),
  persist: true
})
