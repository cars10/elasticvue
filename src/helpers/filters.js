import Fuzzysort from 'fuzzysort'

export function fuzzyTableFilter (items, search, headers) {
  search = search.toString()
  if (search.trim() === '') return items

  const searchSplit = search.split(':')
  const props = typeof headers[0] === 'string' ? headers : headers.map(h => h.value)

  if (searchSplit.length > 1 && props.includes(searchSplit[0])) {
    const column = searchSplit[0]
    let query = searchSplit[1]

    if (query.trim() === '') return items
    if (column.trim() === '') return items

    if (isExact(query)) {
      query = query.slice(1, -1)
      return items.filter(item => {
        return item[column] && item[column] === query
      })
    } else {
      return Fuzzysort.go(query.toLowerCase(), items, {
        key: column,
        allowTypo: false,
        threshold: -50000
      }).map(i => i.obj)
    }
  } else {
    if (isExact(search)) {
      search = search.slice(1, -1)
      return items.filter(item => {
        return props.some(key => {
          return item[key] && item[key] === search
        })
      })
    } else {
      return Fuzzysort.go(search.toLowerCase(), items, {
        keys: props,
        allowTypo: false,
        threshold: -50000
      }).map(i => i.obj)
    }
  }
}

function isExact (query) {
  return query.length > 2 && query[0] === '"' && query.slice(-1) === '"'
}
