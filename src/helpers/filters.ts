export function filterItems (items: Record<string, object>[], searchQuery: string, headerNames: string[]): object[] {
  const search = searchQuery.toString().slice().toLowerCase().trim()
  if (search.length === 0) return items

  const searchSplit = search.split(':')

  if (filterSpecificColumn(searchSplit, headerNames)) {
    const column = searchSplit[0]
    const query = searchSplit[1]

    if (query.trim() === '') return items
    if (column.trim() === '') return items

    return items.filter(item => {
      if (Object.hasOwn(item, column)) {
        return item[column].toString().toLowerCase().includes(query)
      }
    })
  } else {
    return items.filter(item => {
      return headerNames.some(headerName => {
        if (Object.hasOwn(item, headerName)) {
          return item[headerName].toString().toLowerCase().includes(search)
        }
      })
    })
  }
}

const filterSpecificColumn = (searchSplit: string[], headerNames: string[]): boolean => {
  return searchSplit.length > 1 && headerNames.includes(searchSplit[0])
}
