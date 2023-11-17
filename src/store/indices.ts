import { defineStore } from 'pinia'
import { DEFAULT_HIDE_INDICES_REGEX } from '../consts'

type IndicesState = {
  showHiddenIndices: boolean,
  stickyTableHeader: boolean,
  indicesWithoutReplica: boolean,
  hideIndicesRegex: string
}

export const useIndicesStore = defineStore('indices', {
  state: (): IndicesState => ({
    showHiddenIndices: false,
    stickyTableHeader: false,
    indicesWithoutReplica: false,
    hideIndicesRegex: DEFAULT_HIDE_INDICES_REGEX
  }),
  persist: true
})
