/**
 * Pretty prints a nested js object.
 * @param object
 * @param domElement {string}
 * @returns {string}
 */
export function printNestedObject (object, domElement) {
  let declaredParentElement = typeof domElement === 'undefined' ? '' : domElement

  let string = ''
  if ((typeof object === 'object') && (typeof object !== undefined) && (object !== null)) {
    for (let key of Object.keys(object)) {
      if (typeof object[key] === 'object') {
        string += `${key}:<${declaredParentElement}>${printNestedObject(object[key], declaredParentElement)}</${declaredParentElement}>`
      } else {
        string += `${key}: ` + `${object[key]}<br />`
      }
    }
    return string
  } else {
    return string
  }
}

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
