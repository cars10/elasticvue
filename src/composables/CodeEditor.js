import { queryKeywords, querySnippets, queryValues } from '../autocomplete'

import ace from 'ace-builds/src/ace'

import 'ace-builds/src/theme-tomorrow_night'
import 'ace-builds/src/mode-json'
import 'ace-builds/src/ext-searchbox'
import 'ace-builds/src/ext-language_tools'
import { useThemeStore } from '../store/theme'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCodeEditorStore } from '../store/code_editor'
import { beautify } from '../helpers/beautify'
import { writeToClipboard } from '../helpers/clipboard'

export const useCodeEditor = (editorRef, { readOnly, focus, initialValue, emit }) => {
  let aceEditor = null
  let aceEditorSession = null

  const themeStore = useThemeStore()
  const codeEditorStore = useCodeEditorStore()

  onMounted(() => {
    setupAceEditor(editorRef.value, { readOnly })
    if (!readOnly) setupEditingUtils()
    setWrapLines(codeEditorStore.wrapLines)
    setWhitespace(codeEditorStore.useSpaces)
    setTheme(themeStore.dark)
    if (initialValue.value) {
      const beautifulValue = beautify(initialValue.value, codeEditorStore.useSpaces)
      setEditorValue(beautifulValue)
    }
    if (focus) aceEditor.focus()
  })

  watch(() => initialValue.value, newValue => {
    if (aceEditor.getValue() !== newValue) {
      const beautifulValue = beautify(newValue, true)
      setEditorValue(beautifulValue)
    }
  })

  const setTheme = dark => {
    if (dark) {
      aceEditor.setTheme('ace/theme/tomorrow_night')
    } else {
      aceEditor.setTheme('ace/theme/textmate')
    }
  }

  watch(() => themeStore.dark, newValue => (setTheme(newValue)))

  const setWhitespace = useSpaces => {
    if (useSpaces) {
      aceEditorSession.setTabSize(2)
      aceEditorSession.setUseSoftTabs(true)
    } else {
      aceEditorSession.setTabSize(4)
      aceEditorSession.setUseSoftTabs(false)
    }
  }

  const setWrapLines = wrapLines => {
    aceEditorSession.setUseWrapMode(wrapLines)
  }

  const setupAceEditor = (editorRef, additionalOptions) => {
    aceEditor = ace.edit(editorRef, {
      autoScrollEditorIntoView: true
    })
    aceEditorSession = aceEditor.getSession()
    aceEditorSession.setUseWorker(false)
    aceEditorSession.setMode('ace/mode/json')
    aceEditor.setFontSize('13px')
    aceEditor.setShowPrintMargin(false)
    aceEditor.$blockScrolling = Infinity
    if (additionalOptions) aceEditor.setOptions(additionalOptions)
  }

  const setupEditingUtils = () => {
    aceEditor.commands.addCommand({
      bindKey: { win: 'Ctrl+Alt+L', mac: 'Command+Alt+L', linux: 'Ctrl+Alt+L' },
      exec: () => {
        beautifyEditorValue()
      }
    })

    const { completer } = initializeSnippets()
    aceEditor.setOptions({
      enableBasicAutocompletion: [completer],
      enableLiveAutocompletion: true,
      enableSnippets: true
    })

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

  const setEditorValue = value => {
    aceEditor.setValue(value, 1)
  }

  const beautifyEditorValue = () => {
    const newValue = beautify(aceEditor.getValue(), codeEditorStore.useSpaces)
    setEditorValue(newValue)
  }

  return {
    copyContent,
    beautifyEditorValue
  }
}

export const initializeSnippets = () => {
  let snippetManager

  ace.config.loadModule('ace/snippets', m => {
    snippetManager = m.snippetManager
    const parsedSnippets = snippetManager.parseSnippetFile(querySnippets)
    snippetManager.register(parsedSnippets, 'json')
  })

  const snippets = snippetManager.snippetMap.json.map(snip => {
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
    getCompletions: function (editor, session, pos, prefix, callback) {
      const token = session.getTokenAt(pos.row, pos.col)
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

      let allCompletions = []

      if (isKey && addQuotes) allCompletions = snippets
      if (isKey) allCompletions = allCompletions.concat(keywords)
      if (!isKey) allCompletions = allCompletions.concat(values)

      return callback(null, allCompletions)
    }
  }

  return {
    completer
  }
}
