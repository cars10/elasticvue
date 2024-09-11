import { defineStore } from 'pinia'

type IndexTemplatesState = {
  filter: string,
  showHiddenIndices: boolean,
  stickyTableHeader: boolean,
  pagination: any,
}

export const useIndexTemplatesStore = defineStore('indexTemplates', {
  state: (): IndexTemplatesState => ({
    filter: '',
    showHiddenIndices: false,
    stickyTableHeader: false,
    pagination: {
      sortBy: 'index',
      descending: false,
      rowsPerPage: 10
    },
  }),
  persist: {
    pick: [
      'filter',
      'showHiddenIndices',
      'stickyTableHeader',
      'pagination.sortBy',
      'pagination.descending',
      'pagination.rowsPerPage',
    ]
  }
})
