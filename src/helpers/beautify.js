export const beautify = (stringOrObj, useSpaces) => {
  if (!stringOrObj) return stringOrObj

  let copy
  if (typeof stringOrObj === 'string') {
    if (stringOrObj.length === 0) return ''
    copy = (' ' + stringOrObj).slice(1)
  } else {
    if (Object.keys(stringOrObj).length === 0) return ''
    copy = Object.assign({}, stringOrObj)
  }

  try {
    let parsed
    if (typeof stringOrObj === 'string') {
      parsed = JSON.parse(copy)
    } else {
      parsed = copy
    }
    return JSON.stringify(parsed, null, useSpaces ? '  ' : '\t')
  } catch (error) {
    return copy
  }
}
