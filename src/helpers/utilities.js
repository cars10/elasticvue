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
        deep ? Object.assign(duplicatedObject, flattenObject(value, false)) : Object.assign(duplicatedObject, value)
      }
      delete duplicatedObject[key]
    }
  })
  return duplicatedObject
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
