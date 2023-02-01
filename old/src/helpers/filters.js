export function filterItems (items, searchQuery, headers) {
  const search = searchQuery.toString().slice().toLowerCase().trim()
  if (search.length === 0) return items

  const searchSplit = search.split(':')
  const headerNames = typeof headers[0] === 'string' ? headers : headers.map(h => h.value)

  if (filterSpecificColumn(searchSplit, headerNames)) {
    const column = searchSplit[0]
    const query = searchSplit[1]

    if (query.trim() === '') return items
    if (column.trim() === '') return items

    return items.filter(item => {
      return item[column] && item[column].toString().toLowerCase().includes(query)
    })
  } else {
    return items.filter(item => {
      return headerNames.some(headerName => {
        return item[headerName] && item[headerName].toString().toLowerCase().includes(search)
      })
    })
  }
}

const filterSpecificColumn = (searchSplit, headerNames) => {
  return searchSplit.length > 1 && headerNames.includes(searchSplit[0])
}
