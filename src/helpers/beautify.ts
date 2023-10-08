import { stringifyJson } from './json/stringify.ts'
import { parseJson } from './json/parse.ts'

export const beautify = (text: string): string => {
  if (!text) return text
  if (text.length === 0) return ''

  const copy = (' ' + text).slice(1)

  try {
    const parsed = parseJson(copy)
    return stringifyJson(parsed, null, '  ')
  } catch (error) {
    return copy
  }
}
