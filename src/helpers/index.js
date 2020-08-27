import { DEFAULT_SEARCH_PARAMS } from '../consts'

export function normalizeSearchParams (params) {
  const search = {}
  search.query = { query_string: { query: params.q || DEFAULT_SEARCH_PARAMS.q } }
  search.index = params.index || DEFAULT_SEARCH_PARAMS.index
  if (params.sort) {
    search.sort = [{}]
    search.sort[0][`${params.sort}`] = { unmapped_type: 'keyword', order: params.order }
  }

  search.from = params.from ? parseInt(params.from) : DEFAULT_SEARCH_PARAMS.from
  search.size = params.size ? parseInt(params.size) : DEFAULT_SEARCH_PARAMS.size
  if (params.source && params.source.length > 0) search._source = params.source.replace(/\s/g, '').split(',')

  return search
}

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
