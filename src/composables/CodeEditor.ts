import { queryKeywords, querySnippets, queryValues } from '../autocomplete'

// @ts-ignore
import ace from 'ace-builds/src-noconflict/ace'

// @ts-ignore
ace.config.setModuleLoader('ace/mode/json', () => import('ace-builds/src-noconflict/mode-json.js'))
// @ts-ignore
ace.config.setModuleLoader('ace/theme/tomorrow_night', () => import('ace-builds/src-noconflict/theme-tomorrow_night.js'))
// @ts-ignore
ace.config.setModuleLoader('ace/ext/searchbox', () => import('ace-builds/src-noconflict/ext-searchbox.js'))
// @ts-ignore
ace.config.setModuleLoader('ace/ext/language_tools', () => import('ace-builds/src-noconflict/ext-language_tools.js'))
// @ts-ignore
ace.config.setModuleLoader('ace/snippets', () => import('ace-builds/src-noconflict/ext-language_tools.js'))

import { onBeforeUnmount, onMounted, Ref, watch } from 'vue'
import { useThemeStore } from '../store/theme'
import { useCodeEditorStore } from '../store/codeEditor.ts'
import { beautify } from '../helpers/beautify'
import { writeToClipboard } from '../helpers/clipboard'

type Completion = SimpleCompletion | AceAjax.Completion
type SimpleCompletion = {
  value: string,
  caption: string
}

export const useCodeEditor = (editorRef: Ref<HTMLElement | null>, {
  readOnly,
  initialValue,
  emit,
  commands
}: {
  readOnly: boolean,
  initialValue: Ref<string>,
  emit?: any,
  commands?: AceAjax.EditorCommand[]
}) => {
  let aceEditor: AceAjax.Editor = <AceAjax.Editor>{}
  let aceEditorSession: AceAjax.IEditSession = <AceAjax.IEditSession>{}

  const themeStore = useThemeStore()
  const codeEditorStore = useCodeEditorStore()

  onMounted(() => {
    if (!editorRef.value) return
    setupAceEditor(editorRef.value, { readOnly })
    if (!readOnly) setupEditingUtils()
    setWrapLines(codeEditorStore.wrapLines)
    setWhitespace(codeEditorStore.useSpaces)
    setTheme(themeStore.dark)
    if (initialValue.value) {
      const beautifulValue = beautify(initialValue.value, codeEditorStore.useSpaces)
      setEditorValue(beautifulValue)
    }
  })

  watch(() => initialValue.value, newValue => {
    if (aceEditor.getValue() !== newValue) {
      const beautifulValue = beautify(newValue, true)
      setEditorValue(beautifulValue)
    }
  })

  const setTheme = (dark: boolean) => {
    if (dark) {
      aceEditor.setTheme('ace/theme/tomorrow_night')
    } else {
      aceEditor.setTheme('ace/theme/textmate')
    }
  }

  watch(() => themeStore.dark, newValue => (setTheme(newValue)))

  const setWhitespace = (useSpaces: boolean) => {
    if (useSpaces) {
      aceEditorSession.setTabSize(2)
      aceEditorSession.setUseSoftTabs(true)
    } else {
      aceEditorSession.setTabSize(4)
      aceEditorSession.setUseSoftTabs(false)
    }
  }

  const setWrapLines = (wrapLines: boolean) => {
    aceEditorSession.setUseWrapMode(wrapLines)
  }

  const setupAceEditor = (editorRef: HTMLElement, additionalOptions: object) => {
    aceEditor = ace.edit(editorRef, {
      autoScrollEditorIntoView: true
    })
    aceEditorSession = aceEditor.getSession()
    aceEditorSession.setUseWorker(false)
    aceEditorSession.setMode('ace/mode/json')
    aceEditor.setShowPrintMargin(false)
    // @ts-ignore
    aceEditor.$blockScrolling = Infinity
    aceEditor.setOptions({ fontFamily: 'Hack', fontSize: '14px' })
    if (additionalOptions) aceEditor.setOptions(additionalOptions)
    if (commands) aceEditor.commands.addCommands(commands)
  }

  const setupEditingUtils = () => {
    aceEditor.commands.addCommand({
      bindKey: { win: 'Ctrl+Alt+L', mac: 'Command+Alt+L' },
      exec: () => {
        beautifyEditorValue()
      }
    })

    initializeSnippets(aceEditor)

    if (emit) {
      aceEditor.on('change', () => {
        emit('update:modelValue', aceEditor.getValue())
      })
    }
  }

  const unmountEditor = () => {
    aceEditor.destroy()
    aceEditor.container.remove()
  }
  onBeforeUnmount(unmountEditor)

  const copyContent = () => {
    writeToClipboard(aceEditor.getValue())
  }

  watch(() => codeEditorStore.wrapLines, setWrapLines)
  watch(() => codeEditorStore.useSpaces, newValue => {
    setWhitespace(newValue)
    beautifyEditorValue()
  })

  const setEditorValue = (value: string) => (aceEditor.setValue(value, 1))

  const beautifyEditorValue = () => {
    const value = aceEditor.getValue()
    if (!value) return
    const newValue = beautify(value, codeEditorStore.useSpaces)
    setEditorValue(newValue)
  }

  return {
    copyContent,
    beautifyEditorValue
  }
}

export const initializeSnippets = (aceEditor: AceAjax.Editor) => {
  ace.config.loadModule('ace/snippets', () => {
    const { snippetManager } = ace.require('ace/snippets')
    const parsedSnippets = snippetManager.parseSnippetFile(querySnippets)
    snippetManager.register(parsedSnippets, 'json')

    const snippets: AceAjax.Completion[] = snippetManager.snippetMap.json.map((snip: Record<string, any>) => {
      return {
        caption: snip.name,
        snippet: snip.content,
        meta: '[Snip]',
        type: 'snippet',
        score: 1,
        docHTML: snip.content
      }
    })

    const completer = {
      getCompletions: function (_editor: AceAjax.Editor, session: AceAjax.IEditSession, pos: AceAjax.Position, _prefix: string, callback: any) {
        const token = session.getTokenAt(pos.row, pos.column)
        const row = session.getLine(pos.row)
        const addQuotes = token && token.type === 'text' && token.value.indexOf('"') === -1
        const isKey = row && row.indexOf('":') === -1

        const keywords = queryKeywords.map(word => {
          let actualWord = word
          if (addQuotes && isKey) {
            actualWord = `"${word}": `
          } else if (addQuotes) {
            actualWord = `"${word}"`
          }

          return {
            caption: word,
            value: actualWord
          }
        })

        const values = queryValues.map(word => {
          if (addQuotes) {
            return {
              caption: word,
              value: `"${word}"`
            }
          } else {
            return {
              caption: word,
              value: word
            }
          }
        })

        let allCompletions: Completion[] = []

        if (isKey && addQuotes) allCompletions = snippets
        if (isKey) allCompletions = allCompletions.concat(keywords)
        if (!isKey) allCompletions = allCompletions.concat(values)

        return callback(null, allCompletions)
      }
    }

    aceEditor.setOptions({
      enableBasicAutocompletion: [completer],
      enableLiveAutocompletion: true,
      enableSnippets: true
    })
  })
}
