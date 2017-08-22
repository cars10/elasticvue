function printObject (object, showKey) {
  let string = '<span class="show_more" style="display: none"> ... </span>'
  string += '<div class="nested_object">'
  if (typeof object === 'object') {
    for (let key of Object.keys(object)) {
      string += '<div class="test">'
      let valueIsObject = (typeof object[key] === 'object' && object[key] !== null)
      if (showKey) {
        string += '<span class="key'
        if (valueIsObject && !isEmpty(object[key])) {
          string += ' key--clickable'
        }
        string += '" onclick="toggleShowContent(this)">'
        string += '"' + key + '": '
        string += '</span>'
      }
      if (valueIsObject) {
        if (Array.isArray(object[key])) {
          string += '<span class="identifier">[</span>'
          if (!isEmpty(object[key])) {
            string += printObject(object[key], false)
          }
          string += '<span class="identifier">]</span>,'
        } else {
          string += '<span class="identifier">{</span>'
          if (!isEmpty(object[key])) {
            string += printObject(object[key], true)
          }
          string += '<span class="identifier">}</span>,'
        }
      } else {
        string += '<span class="value_type_' + typeof object[key] + '">'
        if (typeof object[key] === 'string') {
          string += '"' + object[key] + '"'
        } else {
          string += object[key]
        }
        string += ','
        string += '</span>'
      }
      string += '</div>'
    }
    string += '</div>'
  }
  return string
}

/* eslint-disable no-unused-vars */
function toggleShowContent (el) {
  toggleDisplay(el.parentNode.querySelector('span.show_more'))
  toggleDisplay(el.parentNode.querySelector('div.nested_object'))
}

function toggleDisplay (el) {
  console.log('toggledisplay with', el)
  if (typeof el !== 'undefined' && el !== null) {
    let currentDisplay = el.style.display
    if (currentDisplay === 'none') {
      if (el.nodeName === 'DIV') {
        el.style.display = 'block'
      } else {
        el.style.display = 'inline-block'
      }
    } else {
      el.style.display = 'none'
    }
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
