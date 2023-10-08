import { onMounted, Ref, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { KeyBinding, keymap } from '@codemirror/view'
import { Compartment } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { basicLight } from 'cm6-theme-basic-light'
import { materialDark } from 'cm6-theme-material-dark'
import { beautify } from '../helpers/beautify.ts'
import { writeToClipboard } from '../helpers/clipboard.ts'
import { useCodeEditorStore } from '../store/codeEditor.ts'
import { useThemeStore } from '../store/theme.ts'

export const useCodeEditor = (editorRef: Ref<HTMLElement | null>, {
  initialValue,
  emit,
  commands
}: {
  initialValue: Ref<string>,
  emit?: any,
  commands?: KeyBinding[]
}) => {
  const themeStore = useThemeStore()
  const codeEditorStore = useCodeEditorStore()

  let codeMirrorEditor: EditorView = <EditorView>{}
  const wrapLines = new Compartment
  const theme = new Compartment

  onMounted(() => {
    initEditor()
  })

  const initEditor = () => {
    if (!editorRef.value) return

    const onChange = EditorView.updateListener.of(update => {
      if (!update.docChanged || !emit) return
      emit('update:modelValue', editorValue())
    })

    codeMirrorEditor = new EditorView({
      extensions: [
        basicSetup,
        json(),
        onChange,
        keymap.of([indentWithTab]),
        keymap.of(commands || []),
        keymap.of([{ key: 'Ctrl-Alt-l', mac: 'Ctrl-Cmd-l', run: beautifyEditorValue }]),
        wrapLines.of(codeEditorStore.wrapLines ? EditorView.lineWrapping : []),
        theme.of(themeStore.dark ? materialDark : basicLight)
      ],
      parent: editorRef.value,
      doc: beautify(initialValue.value),
    })
  }

  watch(() => initialValue.value, newValue => setEditorValue(newValue))

  const beautifyEditorValue = () => {
    const value = editorValue()
    if (!value) return false
    const newValue = beautify(value)
    setEditorValue(newValue)
    return true
  }

  const editorValue = () => (codeMirrorEditor.state.doc.toString())
  const copyContent = () => (writeToClipboard(editorValue()))
  const setEditorValue = (value: string) => {
    if (value === editorValue()) return

    codeMirrorEditor.dispatch({ changes: { from: 0, to: codeMirrorEditor.state.doc.length, insert: value } })
  }
  const setWrapLines = (value: boolean) => {
    codeMirrorEditor.dispatch({ effects: wrapLines.reconfigure(value ? EditorView.lineWrapping : []) })
  }
  watch(() => codeEditorStore.wrapLines, setWrapLines)
  const setTheme = (value: boolean) => {
    codeMirrorEditor.dispatch({ effects: theme.reconfigure(value ? materialDark : basicLight) })
  }
  watch(() => themeStore.dark, setTheme)

  return {
    copyContent,
    beautifyEditorValue
  }
}
