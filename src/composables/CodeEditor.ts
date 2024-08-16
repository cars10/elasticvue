import {onMounted, Ref, watch} from 'vue'
import {basicSetup, EditorView} from 'codemirror'
import {KeyBinding, keymap} from '@codemirror/view'
import {Compartment, Extension, Prec} from '@codemirror/state'
import {indentWithTab} from '@codemirror/commands'
import {json} from '@codemirror/lang-json'
import {baseTheme} from './CodeEditor/theme.ts'
import {beautify} from '../helpers/beautify.ts'
import {writeToClipboard} from '../helpers/clipboard.ts'
import {useCodeEditorStore} from '../store/codeEditor.ts'

import {syntaxTree} from '@codemirror/language'
import {autocompletion} from '@codemirror/autocomplete'
import {queryKeywords, queryValues} from '../autocomplete.ts'
import {vim} from '@replit/codemirror-vim'

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
      options: [
        ...queryValues.map(w => ({ label: w, type: 'text', apply: `"${w}"` })),
      ]
    }
  } else if (nodeBefore.name === 'String') {
    return {
      from: word?.from,
      options: [
        ...queryValues.map(w => ({ label: w, type: 'text', apply: w }))
      ]
    }
  } else {
    return {
      from: word?.from,
      options: [
        ...queryKeywords.map(w => ({ label: w, type: 'keyword', apply: `"${w}"` })),
      ]
    }
  }
}

export const useCodeEditor = (editorRef: Ref<HTMLElement | null>, {
  initialValue,
  emit,
  commands
}: {
  initialValue: Ref<string>,
  emit?: any,
  commands?: KeyBinding[]
}) => {
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

    const vimExtension = vim();
    //fix dark theme can't see cursor and letters
    customizeVimTheme(vimExtension);
    codeMirrorEditor = new EditorView({
      extensions: [
        // make sure vim is included before other keymaps
        codeEditorStore.vimSupport ? vim() : [],
        basicSetup,
        json(),
        autocompletion({ override: [completions] }),
        onChange,
        keymap.of([indentWithTab]),
        Prec.highest(keymap.of(commands || [])),
        keymap.of([{ key: 'Ctrl-Alt-l', mac: 'Ctrl-Cmd-l', run: beautifyEditorValue }]),
        wrapLines.of(codeEditorStore.wrapLines ? EditorView.lineWrapping : []),
        theme.of(baseTheme)
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

    codeMirrorEditor.dispatch({ changes: { from: 0, to: codeMirrorEditor.state.doc.length, insert: beautify(value) } })
  }
  const setWrapLines = (value: boolean) => {
    codeMirrorEditor.dispatch({ effects: wrapLines.reconfigure(value ? EditorView.lineWrapping : []) })
  }
  watch(() => codeEditorStore.wrapLines, setWrapLines)

  return {
    copyContent,
    beautifyEditorValue
  }
}

// I don't know how to customize the font color of the vim panel,
// seems like they don't have provided a way to change the CSS
// so I just let font color inherit
function customizeVimTheme(vimInstance: Extension) {
  (vimInstance as Extension[])[0] = EditorView.baseTheme({
    '.cm-vimMode .cm-cursorLayer:not(.cm-vimCursorLayer)': {
      display: 'none',
    },
    '.cm-vim-panel': {
      padding: '0px 10px',
      fontFamily: 'monospace',
      minHeight: '1.3em',
    },
    '.cm-vim-panel input': {
      border: 'none',
      outline: 'none',
      backgroundColor: 'inherit',
      color: 'inherit', // it works with editor global theme
    },
    '&light .cm-searchMatch': {backgroundColor: '#ffff0054'},
    '&dark .cm-searchMatch': {backgroundColor: '#00ffff8a'},
  })
}
