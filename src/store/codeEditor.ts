import { defineStore } from 'pinia'

type CodeEditorState = {
  wrapLines: boolean
}

export const useCodeEditorStore = defineStore('codeEditor', {
  state: (): CodeEditorState => ({
    wrapLines: false
  }),
  persist: true
})
