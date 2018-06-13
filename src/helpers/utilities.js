/**
 * isEmpty(value)
 *
 * Returns true if given value is
 * * undefined
 * * null
 * * empty string
 * * empty array
 * * empty object
 *
 * @example
 *   isEmpty(1)  => false
 *   isEmpty({}) => true
 * @param value
 * @returns {boolean}
 */
export function isEmpty (value) {
  if (typeof value === 'object') {
    // array or object or null
    if (Array.isArray(value)) {
      return value.length === 0
    } else if (value === null) {
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
 * Returns the unique keys of every object of an array of objects
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

/**
 * flattenObject(object)
 *
 * Returns a flattened object.
 * Warning: by default only flattens the first layer. Pass +true+ as a second parameter to flatten deep
 *
 * @example
 *   var object = {id: 1, data: {name: 'test'}}
 *   flattenObject(object) => {id: 1, name: 'test'}
 *
 *   var deepObject = {id: 1, data: {name: 'test', address: {zip: 123}}}
 *   flattenObject(object)       => {id: 1, name: 'test', address: {zip: 123}}
 *   flattenObject(object, true) => {id: 1, name: 'test', zip: 123}
 *   flattenObject(object, true, true) => {id: 1, data.name: 'test', data.address.zip: 123}
 * @param object
 * @param deep {boolean} - set to true if you want to flatten deep
 * @param concatNames {boolean} - set to true if you want to concat flattened keys
 * @returns {object} the flattened object
 */
export function flattenObject (object, deep, concatNames) {
  let duplicatedObject = Object.assign({}, object) // copy so we do not change the original object
  Object.entries(duplicatedObject).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      if (concatNames) {
        deep ? Object.assign(duplicatedObject, flattenObject(appendStringToAllObjectKeys(value, key), deep, concatNames))
          : Object.assign(duplicatedObject, appendStringToAllObjectKeys(value, key))
      } else {
        deep ? Object.assign(duplicatedObject, flattenObject(value)) : Object.assign(duplicatedObject, value)
      }
      delete duplicatedObject[key]
    }
  })
  return duplicatedObject
}

export function flattenObjectAndStringifyValues (object) {
  let duplicatedObject = Object.assign({}, object) // copy so we do not change the original object
  Object.entries(duplicatedObject).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.assign(duplicatedObject, flattenObjectAndStringifyValues(value))
      delete duplicatedObject[key]
    } else {
      duplicatedObject[key] = stringifyValue(value)
    }
  })
  return duplicatedObject
}

function stringifyValue (value) {
  if (typeof value === 'object' && value === null) return ''
  if (typeof value === 'object') {
    if (value === null) return ''
    if (Array.isArray(value)) return value.join('')
  }
  if (typeof value === 'undefined') return ''
  if (typeof value === 'boolean' || typeof value === 'number') return String(value)
  return value
}

function appendStringToAllObjectKeys (object, append) {
  for (let key of Object.keys(object)) {
    renameKey(object, append + '.' + key, key)
  }
  return object
}

function renameKey (object, newKey, oldKey) {
  if (newKey !== oldKey) {
    Object.defineProperty(object, newKey, Object.getOwnPropertyDescriptor(object, oldKey))
    delete object[oldKey]
  }
}
