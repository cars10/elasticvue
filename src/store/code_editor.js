import { defineStore } from 'pinia'

export const useCodeEditorStore = defineStore('codeEditor', {
  state: () => ({
    useSpaces: false,
    wrapLines: false
  }),
  persist: true
})
