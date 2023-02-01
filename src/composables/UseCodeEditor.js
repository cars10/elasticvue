import { queryKeywords, querySnippets, queryValues } from '../autocomplete'

import ace from 'ace-builds/src/ace'

import 'ace-builds/src/theme-monokai'
import 'ace-builds/src/mode-json'
import 'ace-builds/src/ext-searchbox'
import 'ace-builds/src/ext-language_tools'
import { useThemeStore } from '../store/theme'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useCodeEditorStore } from '../store/code_editor'
import { beautify } from '../helpers/beautify'
import { writeToClipboard } from '../helpers/clipboard'

export const useCodeEditor = (editorRef, { readOnly, focus, initialValue }) => {
  const aceEditor = ref(null)

  onMounted(() => {
    setupAceEditor(editorRef.value, { readOnly })
    setWrapLines(codeEditorStore.wrapLines)
    setTheme(themeStore.dark)
    if (initialValue.value) {
      const beautifulValue = beautify(initialValue.value, codeEditorStore.useSpaces)
      setEditorValue(beautifulValue)
    }
    if (focus) aceEditor.value.focus()
  })

  watch(() => initialValue.value, newValue => {
    if (aceEditor.value.getValue() !== newValue) {
      const beautifulValue = beautify(newValue, true)
      setEditorValue(beautifulValue)
    }
  })

  const setTheme = dark => {
    if (dark) {
      aceEditor.value.setTheme('ace/theme/monokai')
    } else {
      aceEditor.value.setTheme('ace/theme/textmate')
    }
  }

  const themeStore = useThemeStore()
  watch(() => themeStore.dark, newValue => (setTheme(newValue)))

  const setWhitespace = useSpaces => {
    if (useSpaces) {
      aceEditor.value.getSession().setTabSize(2)
      aceEditor.value.getSession().setUseSoftTabs(true)
    } else {
      aceEditor.value.getSession().setTabSize(4)
      aceEditor.value.getSession().setUseSoftTabs(false)
    }
  }

  const setWrapLines = wrapLines => {
    aceEditor.value.getSession().setUseWrapMode(wrapLines)
  }

  const setupAceEditor = (editorRef, additionalOptions) => {
    aceEditor.value = ace.edit(editorRef, {
      autoScrollEditorIntoView: true
    })
    aceEditor.value.getSession().setUseWorker(false)
    aceEditor.value.getSession().setMode('ace/mode/json')
    aceEditor.value.setFontSize('13px')
    aceEditor.value.setShowPrintMargin(false)
    aceEditor.value.$blockScrolling = Infinity
    if (additionalOptions) aceEditor.value.setOptions(additionalOptions)
  }

  const unmountEditor = () => {
    aceEditor.value.destroy()
    aceEditor.value.container.remove()
  }
  onBeforeUnmount(unmountEditor)

  const copyContent = () => {
    writeToClipboard(aceEditor.value.getValue())
  }

  const codeEditorStore = useCodeEditorStore()
  watch(() => codeEditorStore.wrapLines, setWrapLines)
  watch(() => codeEditorStore.useSpaces, newValue => {
    setWhitespace(newValue)
    beautifyEditorValue(newValue)
  })

  const setEditorValue = value => {
    aceEditor.value.setValue(value, 1)
  }

  const beautifyEditorValue = useSpaces => {
    const newValue = beautify(aceEditor.value.getValue(), useSpaces)
    setEditorValue(newValue)
  }

  return {
    copyContent,
    setTheme,
    setWhitespace,
    setWrapLines,
    unmountEditor,
    setupAceEditor,
    beautifyEditorValue,
    setEditorValue
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
