import { defineStore } from 'pinia'

type CodeEditorState = {
  useSpaces: boolean,
  wrapLines: boolean
}

export const useCodeEditorStore = defineStore('codeEditor', {
  state: (): CodeEditorState => ({
    useSpaces: false,
    wrapLines: false
  }),
  persist: true
})
