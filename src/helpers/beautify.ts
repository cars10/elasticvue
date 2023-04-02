export const beautify = (text: string, useSpaces: boolean): string => {
  if (!text) return text
  if (text.length === 0) return ''

  const copy = (' ' + text).slice(1)

  try {
    const parsed = JSON.parse(copy)
    return JSON.stringify(parsed, null, useSpaces ? '  ' : '\t')
  } catch (error) {
    return copy
  }
}
