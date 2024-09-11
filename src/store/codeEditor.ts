import { defineStore } from 'pinia'

type CodeEditorState = {
  wrapLines: boolean,
  vimMode: boolean
}

export const useCodeEditorStore = defineStore('codeEditor', {
  state: (): CodeEditorState => ({
    vimMode: false,
    wrapLines: false
  }),
  persist: true
})
