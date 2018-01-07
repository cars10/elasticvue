import { ELASTICSEARCH_API_VERSIONS } from '../consts'

/**
 * Returns true if given value is
 * * undefined
 * * null
 * * empty string
 * * empty array
 * * empty object
 * @param value
 * @returns {boolean}
 */
export function isEmpty (value) {
  if (typeof value === 'object') {
    // array or object or null
    if (Array.isArray(value)) {
      // array
      return value.length === 0
    } else if (value === null) {
      // null
      return true
    } else {
      // object
      return Object.keys(value).length === 0
    }
  } else {
    return (typeof value === 'undefined') || (value === '')
  }
}

/**
 * Return the correct api version for the elasticsearch version.
 * For example elasticsearch version '6.1' uses api version '6.x'
 * @param version
 * @returns {string}
 */
export function mapElasticsearchApiVersion (version) {
  switch (version) {
    case ELASTICSEARCH_API_VERSIONS:
      return version
    case '6.1':
      return '6.x'
    default:
      return '6.x'
  }
}
