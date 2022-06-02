import { queryKeywords, querySnippets, queryValues } from '@/autocomplete'
import { writeToClipboard } from '@/services/tauri/clipboard'

const ace = require('ace-builds/src-noconflict/ace')
require('ace-builds/src-noconflict/mode-json')
require('ace-builds/src-noconflict/theme-monokai')
require('ace-builds/src-noconflict/ext-searchbox')
require('ace-builds/src-noconflict/ext-language_tools')

export const editorUtils = editor => {
  const setTheme = dark => {
    if (dark) {
      editor.value.setTheme('ace/theme/monokai')
    } else {
      editor.value.setTheme('ace/theme/textmate')
    }
  }

  const setWhitespace = useSpaces => {
    if (useSpaces) {
      editor.value.getSession().setTabSize(2)
      editor.value.getSession().setUseSoftTabs(true)
    } else {
      editor.value.getSession().setTabSize(4)
      editor.value.getSession().setUseSoftTabs(false)
    }
  }

  const setWrapLines = wrapLines => {
    editor.value.getSession().setUseWrapMode(wrapLines)
  }

  const setupAceEditor = (editorRef, additionalOptions) => {
    editor.value = ace.edit(editorRef, {
      autoScrollEditorIntoView: true
    })
    editor.value.getSession().setUseWorker(false)
    editor.value.getSession().setMode('ace/mode/json')
    editor.value.setFontSize('13px')
    editor.value.setShowPrintMargin(false)
    editor.value.$blockScrolling = Infinity
    if (additionalOptions) editor.value.setOptions(additionalOptions)
  }

  const unmountEditor = () => {
    editor.value.destroy()
    editor.value.container.remove()
  }

  const copyContent = () => {
    writeToClipboard(editor.value.getValue())
  }

  return {
    copyContent,
    setTheme,
    setWhitespace,
    setWrapLines,
    unmountEditor,
    setupAceEditor
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
