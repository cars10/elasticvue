import { EditorView } from '@codemirror/view'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const baseThemeTheme = EditorView.theme({})

const baseThemeHighlightStyle = HighlightStyle.define([
  { tag: [tags.brace, tags.squareBracket], color: 'var(--code-editor-base-color)' },
  { tag: tags.propertyName, color: 'var(--code-editor-syntax-property-name-color)' },
  { tag: tags.keyword, color: 'var(--code-editor-syntax-keyword-color)' },
  { tag: tags.bool, color: 'var(--code-editor-syntax-bool-color)' },
  { tag: tags.number, color: 'var(--code-editor-syntax-number-color)' },
  { tag: tags.string, color: 'var(--code-editor-syntax-string-color)' }
])

const baseTheme = [baseThemeTheme, syntaxHighlighting(baseThemeHighlightStyle)]
export { baseTheme, baseThemeHighlightStyle, baseThemeTheme }
