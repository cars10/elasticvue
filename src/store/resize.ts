import { defineStore } from 'pinia'

type ResizeState = {
  indicesTable: number
  indexTemplatesTable: number
  shardRecoveryTable: number
  modalLoaderCodeViewer: number
  restForm: number
  searchQuery: number
  sqlQuery: number
  searchTable: number
  documentEdit: number
  roleFormIndices: number
}

export const useResizeStore = defineStore('resize', {
  state: (): ResizeState => ({
    indicesTable: 500,
    indexTemplatesTable: 500,
    shardRecoveryTable: 500,
    modalLoaderCodeViewer: 600,
    restForm: 400,
    searchQuery: 400,
    sqlQuery: 160,
    searchTable: 500,
    documentEdit: 800,
    roleFormIndices: 180
  }),
  persist: true
})
