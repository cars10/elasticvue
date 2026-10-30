import { parseJson } from './json/parse.ts'
import type { FieldCatalog } from '../types/search.ts'

export type DocumentInputKind = 'text' | 'number' | 'boolean' | 'date' | 'json'

const NUMBER_TYPES = ['long', 'integer', 'short', 'byte', 'double', 'float', 'half_float', 'scaled_float', 'unsigned_long']
const TEXT_TYPES = ['text', 'keyword', 'string', 'wildcard', 'constant_keyword', 'match_only_text', 'ip', 'version']

export const inputKind = (type?: string): DocumentInputKind => {
  if (!type) return 'json'
  if (NUMBER_TYPES.includes(type)) return 'number'
  if (TEXT_TYPES.includes(type)) return 'text'
  if (type === 'boolean') return 'boolean'
  if (type === 'date' || type === 'date_nanos') return 'date'
  return 'json'
}

export const documentInputs = (catalog: FieldCatalog) =>
  Object.values(catalog)
    .filter((field) => !field.subField)
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((field) => ({ name: field.name, type: field.types[0], kind: inputKind(field.types[0]) }))

const parsedValue = (kind: DocumentInputKind, value: unknown) => {
  if (kind === 'number' || kind === 'json') {
    try {
      return parseJson(String(value))
    } catch (_e) {
      return value
    }
  }
  return value
}

export const buildDocument = (inputs: { name: string; kind: DocumentInputKind }[], values: Record<string, unknown>) => {
  const document: Record<string, any> = Object.create(null)
  inputs.forEach(({ name, kind }) => {
    const value = values[name]
    if (value === undefined || value === null || value === '') return
    const parts = name.split('.')
    const parent = parts.slice(0, -1).reduce((object, part) => (object[part] ??= Object.create(null)), document)
    parent[parts[parts.length - 1]] = parsedValue(kind, value)
  })
  return document
}
