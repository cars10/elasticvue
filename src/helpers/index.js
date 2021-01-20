const SORTABLE_TYPES = ['long', 'integer', 'double', 'float', 'date', 'boolean', 'keyword']

export function sortableField (fieldName, property) {
  if (['_index', '_type', '_id'].includes(fieldName)) return fieldName

  if (property) {
    if (SORTABLE_TYPES.includes(property.type)) {
      return fieldName
    } else if (property.fields) {
      if (property.fields.keyword) {
        return `${fieldName}.keyword`
      } else {
        const subFields = Object.keys(property.fields)

        for (let i = 0; i < subFields.length; i++) {
          const subField = subFields[i]
          if (SORTABLE_TYPES.includes(property.fields[subField].type)) return `${fieldName}.${subField}`
        }
      }
    }
  }
  return null
}

export function capitalize (string) {
  if (typeof string !== 'string') throw new TypeError('arg must be a string')
  if (string.length === 0) return ''
  return string[0].toUpperCase() + string.slice(1)
}

export function truncate (text, limit) {
  if (!text) return ''
  if (typeof text !== 'string') text = text.toString()

  if (text.length > limit) {
    return text.slice(0, limit) + ' ...'
  } else {
    return text
  }
}

export function urlWithoutCredentials (url) {
  if (url.includes('@')) {
    let credentials = url.match(/https?:\/\/(.*(:.*)?)@/)[1]
    return url.replace(credentials + '@', '')
  } else {
    return url
  }
}

export function buildFetchAuthHeaderFromUrl (url) {
  if (url.includes('@')) {
    let credentials = url.match(/https?:\/\/(.*(:.*)?)@/)[1].split(':')
    if (credentials.length === 2) {
      return { 'Authorization': 'Basic ' + Buffer.from(credentials[0] + ':' + credentials[1]).toString('base64') }
    } else {
      return { 'Authorization': 'Basic ' + Buffer.from(credentials[0]).toString('base64') }
    }
  } else {
    return {}
  }
}

export const debounce = (fn, timeout, immediate) => {
  let timerId

  return function (...args) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn(...args)
    }, immediate ? 0 : timeout)
  }
}
