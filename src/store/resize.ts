import { defineStore } from 'pinia'

type ResizeState = {
  indicesTable: number,
  indexTemplatesTable: number,
  modalLoaderCodeViewer: number,
  restForm: number,
  searchQuery: number,
  searchTable: number,
  documentEdit: number
}

export const useResizeStore = defineStore('resize', {
  state: (): ResizeState => ({
    indicesTable: 500,
    indexTemplatesTable: 500,
    modalLoaderCodeViewer: 600,
    restForm: 400,
    searchQuery: 400,
    searchTable: 500,
    documentEdit: 800
  }),
  persist: true
})
