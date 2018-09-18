import Fuzzysort from 'fuzzysort'

export function fuzzyTableFilter (items, search, headers) {
  search = search.toString().toLowerCase()
  if (search.trim() === '') return items

  const searchSplit = search.split(':')
  const props = headers.map(h => h.value)

  if (searchSplit.length > 1 && props.includes(searchSplit[0])) {
    const column = searchSplit[0]
    const query = searchSplit[1]

    if (query.trim() === '') return items

    return Fuzzysort.go(query, items, { key: column, allowTypo: false }).map(i => i.obj)
  } else {
    return Fuzzysort.go(search, items, { keys: props, allowTypo: false }).map(i => i.obj)
  }
}
