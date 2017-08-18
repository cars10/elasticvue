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
