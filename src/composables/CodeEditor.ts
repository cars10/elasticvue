import { onMounted, Ref, watch } from 'vue'
import { EditorView, basicSetup } from 'codemirror'
import { KeyBinding, keymap } from '@codemirror/view'
import { Compartment, Prec } from '@codemirror/state'
import { indentWithTab } from '@codemirror/commands'
import { json } from '@codemirror/lang-json'
import { baseTheme } from './CodeEditor/theme.ts'
import { beautify } from '../helpers/beautify.ts'
import { writeToClipboard } from '../helpers/clipboard.ts'
import { useCodeEditorStore } from '../store/codeEditor.ts'

import { foldable, foldEffect, unfoldEffect, syntaxTree } from '@codemirror/language'
import { autocompletion } from '@codemirror/autocomplete'
import { queryKeywords, queryValues } from '../autocomplete.ts'
import { vim } from '@replit/codemirror-vim'

/*
 JsonText
 {
 [
 Object
 PropertyName
 Property
 String
 */
const completions = (context: any) => {
  const word = context.matchBefore(/\w*/)
  if (!context.explicit) return null

  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
  if (nodeBefore.name === 'Property') {
    return {
      from: word?.from,
      options: [...queryValues.map((w) => ({ label: w, type: 'text', apply: `"${w}"` }))]
    }
  } else if (nodeBefore.name === 'String') {
    return {
      from: word?.from,
      options: [...queryValues.map((w) => ({ label: w, type: 'text', apply: w }))]
    }
  } else {
    return {
      from: word?.from,
      options: [...queryKeywords.map((w) => ({ label: w, type: 'keyword', apply: `"${w}"` }))]
    }
  }
}

export const useCodeEditor = (
  editorRef: Ref<HTMLElement | null>,
  {
    initialValue,
    emit,
    commands,
    onPaste
  }: {
    initialValue: Ref<string>
    emit?: any
    commands?: KeyBinding[]
    onPaste?: (data: string) => void
  }
) => {
  const codeEditorStore = useCodeEditorStore()

  let codeMirrorEditorView: EditorView = <EditorView>{}
  const wrapLines = new Compartment()
  const theme = new Compartment()

  onMounted(() => {
    initEditor()
  })

  const initEditor = () => {
    if (!editorRef.value) return

    const onChange = EditorView.updateListener.of((update) => {
      if (!update.docChanged || !emit) return
      emit('update:modelValue', editorValue())
    })

    const eventHandlers = []
    if (onPaste) {
      const handler = EditorView.domEventHandlers({
        paste(event) {
          const newValue = event.clipboardData?.getData('text')
          if (newValue) onPaste(newValue)
        }
      })
      eventHandlers.push(handler)
    }

    const vimExtension = vim()
    codeMirrorEditorView = new EditorView({
      extensions: [
        // make sure vim is included before other keymaps
        codeEditorStore.vimMode ? vimExtension : [],
        basicSetup,
        json(),
        autocompletion({ override: [completions] }),
        onChange,
        eventHandlers,
        keymap.of([indentWithTab]),
        Prec.highest(keymap.of(commands || [])),
        keymap.of([{ key: 'Ctrl-Alt-l', mac: 'Ctrl-Cmd-l', run: beautifyEditorValue }]),
        wrapLines.of(codeEditorStore.wrapLines ? EditorView.lineWrapping : []),
        theme.of(baseTheme)
      ],
      parent: editorRef.value,
      doc: beautify(initialValue.value)
    })
  }

  watch(
    () => initialValue.value,
    (newValue) => setEditorValue(newValue)
  )

  const beautifyEditorValue = () => {
    const value = editorValue()
    if (!value) return false
    const newValue = beautify(value)
    setEditorValue(newValue)
    return true
  }

  const editorValue = () => codeMirrorEditorView.state.doc.toString()
  const copyContent = () => writeToClipboard(editorValue())
  const setEditorValue = (value: string) => {
    if (value === editorValue()) return

    codeMirrorEditorView.dispatch({
      changes: {
        from: 0,
        to: codeMirrorEditorView.state.doc.length,
        insert: beautify(value)
      }
    })
  }
  const setWrapLines = (value: boolean) => {
    codeMirrorEditorView.dispatch({ effects: wrapLines.reconfigure(value ? EditorView.lineWrapping : []) })
  }
  watch(() => codeEditorStore.wrapLines, setWrapLines)

  const foldRecursive = (effect: typeof foldEffect | typeof unfoldEffect) => {
    const state = codeMirrorEditorView.state

    const foldRanges: { from: number; to: number }[] = []
    syntaxTree(state).iterate({
      enter(node) {
        if (node.from === 0) return
        const isFoldable = foldable(state, node.from, node.to)
        if (isFoldable) foldRanges.push({ from: isFoldable.from, to: isFoldable.to })
      }
    })

    codeMirrorEditorView.dispatch({
      effects: foldRanges.map((range) => effect.of({ from: range.from, to: range.to }))
    })
  }
  const collapseAll = () => foldRecursive(foldEffect)
  const expandAll = () => foldRecursive(unfoldEffect)

  return {
    copyContent,
    collapseAll,
    expandAll,
    beautifyEditorValue
  }
}
