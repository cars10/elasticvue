import { defineStore } from 'pinia'
import { DEFAULT_HIDE_INDICES_REGEX } from '../consts'

export const useIndicesStore = defineStore('indices', {
  state: () => ({
    showHiddenIndices: false,
    stickyTableHeader: false,
    hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX
  }),
  persist: true
})
