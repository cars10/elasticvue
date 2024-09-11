import { defineStore } from 'pinia'

type CodeEditorState = {
  wrapLines: boolean,
  vimSupport: boolean
}

export const useCodeEditorStore = defineStore('codeEditor', {
  state: (): CodeEditorState => ({
    vimSupport: false,
    wrapLines: false
  }),
  persist: true
})
