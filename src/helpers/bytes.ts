import prettyBytes from 'pretty-bytes'

export const prettyPrintByteString = (value: string | number): string => {
  if (value === null || typeof value === 'undefined') return ''

  if (typeof value === 'number' && !isNaN(value)) {
    return prettyBytes(value)
  } else {
    return `${value} B`
  }
}
