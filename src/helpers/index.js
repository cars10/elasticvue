import { parseJsonBigInt, stringifyJsonBigInt } from '@/helpers/json_parse'

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

export function buildFetchAuthHeader (username, password) {
  if (username.length > 0 && password.length > 0) {
    return 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
  } else {
    return 'Basic ' + Buffer.from(username).toString('base64')
  }
}

export const debounce = (fn, timeout) => {
  let timerId

  return function (...args) {
    clearTimeout(timerId)
    timerId = setTimeout(() => {
      fn(...args)
    }, timeout)
  }
}

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
      parsed = parseJsonBigInt(copy)
    } else {
      parsed = copy
    }
    return stringifyJsonBigInt(parsed, null, useSpaces ? '  ' : '\t')
  } catch (error) {
    console.error(error)
    return copy
  }
}
