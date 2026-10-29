export type QueryToken = {
  start: number
  end: number
  prefix: string
  field: string | null
  value: string
}

export type QuerySuggestion = { kind: 'field' | 'value' | 'operator' | 'recent'; label: string; insert: string }

const OPERATORS = ['AND', 'OR', 'NOT']
const RESERVED = /[+\-=&|><!(){}[\]^"~*?:\\/ ]/g
const SIMPLE_VALUE = /^[\p{L}\p{N}_.@]+$/u

export const escapeQueryField = (name: string) => name.replace(RESERVED, '\\$&')
const unescape = (text: string) => text.replace(/\\(.)/g, '$1')

export const quoteQueryValue = (value: string) => (SIMPLE_VALUE.test(value) ? value : `"${value.replace(/["\\]/g, '\\$&')}"`)

const unescapedColon = (text: string) => {
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\') i++
    else if (text[i] === ':') return i
  }
  return -1
}

export const queryToken = (text: string, caret: number): QueryToken => {
  let start = 0
  let quoted = false
  for (let i = 0; i < caret; i++) {
    if (text[i] === '\\') i++
    else if (text[i] === '"') quoted = !quoted
    else if (!quoted && (text[i] === ' ' || text[i] === '(')) start = i + 1
  }

  let end = caret
  while (!quoted && end < text.length && !/[\s()]/.test(text[end])) end++

  const raw = text.slice(start, caret)
  const prefix = raw.match(/^[-+!]*/)![0]
  const term = raw.slice(prefix.length)
  const colon = unescapedColon(term)
  if (colon === -1) return { start, end, prefix, field: null, value: unescape(term) }

  return {
    start,
    end,
    prefix,
    field: unescape(term.slice(0, colon)),
    value: unescape(term.slice(colon + 1).replace(/^"/, ''))
  }
}

const rank = (candidates: string[], search: string, limit: number) => {
  const needle = search.toLowerCase()
  const starts = candidates.filter((c) => c.toLowerCase().startsWith(needle))
  const contains = candidates.filter((c) => !c.toLowerCase().startsWith(needle) && c.toLowerCase().includes(needle))
  return [...starts, ...contains].slice(0, limit)
}

export const querySuggestions = (token: QueryToken, fields: string[], values: string[], limit = 10): QuerySuggestion[] => {
  if (token.field !== null) {
    const field = escapeQueryField(token.field)
    return rank(values, token.value, limit).map((value) => ({
      kind: 'value',
      label: value,
      insert: `${token.prefix}${field}:${quoteQueryValue(value)} `
    }))
  }

  if (!token.value) return []

  const operators = /^[a-z]+$/i.test(token.value)
    ? OPERATORS.filter((op) => op.startsWith(token.value.toUpperCase())).map((op): QuerySuggestion => ({
        kind: 'operator',
        label: op,
        insert: `${op} `
      }))
    : []
  const matching = rank(fields, token.value, limit).map((name): QuerySuggestion => ({
    kind: 'field',
    label: name,
    insert: `${token.prefix}${escapeQueryField(name)}:`
  }))
  return [...matching, ...operators].slice(0, limit)
}

export const recentQuerySuggestions = (text: string, queries: string[], limit = 5): QuerySuggestion[] => {
  const needle = text.trim().toLowerCase()
  if (!needle || needle === '*') return []
  return [...new Set(queries)]
    .filter((query) => query !== text && query.toLowerCase().includes(needle))
    .slice(0, limit)
    .map((query) => ({ kind: 'recent', label: query, insert: query }))
}

export const applySuggestion = (text: string, token: QueryToken, insert: string) => {
  const rest = text.slice(token.end)
  return {
    text: text.slice(0, token.start) + insert + (insert.endsWith(' ') ? rest.replace(/^ +/, '') : rest),
    caret: token.start + insert.length
  }
}
