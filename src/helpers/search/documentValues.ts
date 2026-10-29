import { stringifyJson } from '../json/stringify.ts'

export const hasOwn = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key)

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

// Null prototype, so fields named like __proto__ are stored as plain keys
export const flattenDocument = (source: unknown, prefix = '', result: Record<string, unknown> = Object.create(null)) => {
  if (!isPlainObject(source)) return result

  Object.entries(source).forEach(([key, value]) => {
    const path = prefix + key
    if (isPlainObject(value) && Object.keys(value).length > 0) flattenDocument(value, `${path}.`, result)
    else result[path] = value
  })

  return result
}

export const getFieldValue = (source: unknown, path: string): unknown => {
  if (Array.isArray(source)) {
    const values = source.map((item) => getFieldValue(item, path)).filter((value) => value !== undefined)
    return values.length > 0 ? values : undefined
  }
  if (!isPlainObject(source)) return undefined
  if (hasOwn(source, path)) return source[path]

  const parts = path.split('.')
  for (let i = parts.length - 1; i > 0; i--) {
    const key = parts.slice(0, i).join('.')
    if (hasOwn(source, key)) return getFieldValue(source[key], parts.slice(i).join('.'))
  }

  return undefined
}

export const formatFieldValue = (value: unknown): string => {
  if (value === undefined) return ''
  if (value === null) return 'null'
  if (typeof value === 'object') return stringifyJson(value)
  return String(value)
}

const isNumeric = (value: unknown): value is number | bigint => typeof value === 'number' || typeof value === 'bigint'

export const compareValues = (a: unknown, b: unknown): number => {
  if (isNumeric(a) && isNumeric(b)) return a < b ? -1 : a > b ? 1 : 0
  return formatFieldValue(a).localeCompare(formatFieldValue(b), undefined, { numeric: true })
}

export const summarizeDocument = (source: unknown, maxLength: number) => {
  const parts: string[] = []
  let length = 0

  for (const [path, value] of Object.entries(flattenDocument(source))) {
    const part = `${path}: ${formatFieldValue(value)}`
    parts.push(part)
    length += part.length + 3
    if (length >= maxLength) break
  }

  const summary = parts.join(' · ')
  return summary.length > maxLength ? `${summary.slice(0, maxLength)}…` : summary
}

const csvCell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

export const toCsv = (rows: string[][]) => rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
