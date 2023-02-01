import { parseJsonBigInt, stringifyJsonBigInt } from '@/helpers/json_parse'
import { DEFAULT_SEARCH_RESULT_COLUMNS } from '@/consts'

const SORTABLE_TYPES = ['long', 'integer', 'double', 'float', 'date', 'boolean', 'keyword']

export function sortableField (fieldName, property) {
  if (DEFAULT_SEARCH_RESULT_COLUMNS.includes(fieldName)) return fieldName

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
  } else if (username.length > 0) {
    return 'Basic ' + Buffer.from(username).toString('base64')
  } else if (password.length > 0) {
    // Assume password is an API key
    return 'ApiKey ' + password
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
    return copy
  }
}

const FORBIDDEN_OBJECT_KEYS = ['constructor', '__proto__']
export const renameForbiddenObjectKeys = obj => {
  FORBIDDEN_OBJECT_KEYS.forEach(forbiddenKey => {
    if (Object.prototype.hasOwnProperty.call(obj, forbiddenKey)) {
      obj[`?${forbiddenKey}`] = obj[forbiddenKey]
      delete obj[forbiddenKey]
    }
  })
}

export const nodeRoleTitle = role => {
  let title = ''
  if (role.includes('c')) title += 'c - cold node\r\n'
  if (role.includes('d')) title += 'd - data node\r\n'
  if (role.includes('f')) title += 'f - frozen node\r\n'
  if (role.includes('h')) title += 'h - hot node\r\n'
  if (role.includes('i')) title += 'i - ingest node\r\n'
  if (role.includes('l')) title += 'l - machine learning node\r\n'
  if (role.includes('m')) title += 'm - master-eligible node\r\n'
  if (role.includes('r')) title += 'r - remote cluster client node\r\n'
  if (role.includes('s')) title += 's - content node\r\n'
  if (role.includes('t')) title += 't - transform node\r\n'
  if (role.includes('v')) title += 'v - voting-only node\r\n'
  if (role.includes('w')) title += 'v - warm node\r\n'
  if (role.includes('-')) title += 'coordinating nodes\r\n'

  return title
}

export const reloadHomePage = (router, instanceId) => {
  try {
    const currentRoute = router.currentRoute

    if (currentRoute.name === 'Home' && currentRoute.params.instanceId === instanceId) {
      window.location.reload()
    } else {
      const route = { name: 'Home', params: { instanceId } }
      if (router.mode === 'history') {
        const url = router.resolve(route).href
        window.location.replace(url)
      } else {
        router.push(route)
        router.go()
      }
    }
  } catch (e) {
  }
}
