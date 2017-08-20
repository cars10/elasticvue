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
        string += `<${declaredParentElement}>${key}: ${printNestedObject(object[key], declaredParentElement)}</${declaredParentElement}>`
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
 * Returns true if given value is undefined, null or an empty string.
 * Also returns null if value is an empty array.
 * @param value
 * @returns {boolean}
 */
export function isEmpty (value) {
  if (Array.isArray(value)) {
    return value.length === 0
  } else {
    return (typeof value === 'undefined') || (value === '') || (value === null)
  }
}
