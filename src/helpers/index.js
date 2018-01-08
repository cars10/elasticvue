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

/**
 * Returns the unique keys every object of an array of objects
 * Example:
 *   var array = [{a: 1, b: {b1: 1, b2: 2}}, {b: {b2: 2, b3: 3}, c: 4}]
 *   objectArrayUniqueKeys (array)      => ['a', 'b', 'c']
 *   objectArrayUniqueKeys (array, 'b') => ['b1', 'b2', 'b3']
 * @param array
 * @param key - Optional
 * @returns {*[]}
 */
export function objectArrayUniqueKeys (array, key) {
  let nested = []
  if (key !== undefined) {
    nested = array.map(value => (Object.keys(value[key])))
  } else {
    nested = array.map(value => (Object.keys(value)))
  }
  let flattened = [].concat.apply([], nested)
  return [...new Set(flattened)]
}
