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
