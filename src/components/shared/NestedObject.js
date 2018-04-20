const renderObject = function (createElement, object) {
  let array = []
  let header = createElement('div', '{')
  Object.keys(object).map(key => {
    if (typeof object[key] === 'object' && object[key] !== null) {
      array.push(createElement('div', [
        createElement('span', `${key}: `),
        createElement('div', renderObject(createElement, object[key]))
      ]))
    } else {
      array.push(createElement('div', [
        createElement('span', `${key}: `),
        createElement('span', object[key])
      ]))
    }
  })
  let footer = createElement('div', '}')
  return [header, createElement('div', {class: 'pl-4'}, array), footer]
}

export default {
  props: ['object'],
  render: function (createElement) {
    return createElement('div', renderObject(createElement, Object.assign({}, this.object)))
  }
}
