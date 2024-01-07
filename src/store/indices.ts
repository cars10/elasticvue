import { defineStore } from 'pinia'
import { DEFAULT_HIDE_INDICES_REGEX } from '../consts'

type IndicesState = {
  filter: string,
  showHiddenIndices: boolean,
  stickyTableHeader: boolean,
  hideIndicesRegex: string
}

export const useIndicesStore = defineStore('indices', {
  state: (): IndicesState => ({
    filter: '',
    showHiddenIndices: false,
    stickyTableHeader: false,
    hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX
  }),
  persist: true
})
