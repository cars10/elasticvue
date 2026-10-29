const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const flattenDocument = (source: unknown, prefix = '', result: Record<string, unknown> = {}) => {
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
  if (path in source) return source[path]

  const parts = path.split('.')
  for (let i = parts.length - 1; i > 0; i--) {
    const key = parts.slice(0, i).join('.')
    if (key in source) return getFieldValue(source[key], parts.slice(i).join('.'))
  }

  return undefined
}

export const formatFieldValue = (value: unknown): string => {
  if (value === undefined) return ''
  if (value === null) return 'null'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
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
