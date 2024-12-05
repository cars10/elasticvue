type Filterable = Record<string, any>

export function filterItems<T extends Filterable> (items: T[], searchQuery: string, headerNames: string[]): T[] {
  const search = searchQuery.toString().slice().toLowerCase().trim()
  if (search.length === 0) return items

  const searchSplit = search.split(':')

  if (filterSpecificColumn(searchSplit, headerNames)) {
    const column = searchSplit[0]
    const query = searchSplit[1]

    if (query.trim() === '') return items
    if (column.trim() === '') return items

    return items.filter(item => {
      if (columnFilterable(item, column)) {
        return filterColumn(item, column, query)
      }
    })
  } else {
    return items.filter(item => {
      return headerNames.some(headerName => {
        if (columnFilterable(item, headerName)) {
          return filterColumn(item, headerName, search)
        }
      })
    })
  }
}

const columnFilterable = (item: any, headerName: string) =>{
  return Object.hasOwnProperty.bind(item)(headerName) && item[headerName] !== null
}

const filterColumn = (item: any, headerName: string, search: string) => {
  try {
    return item[headerName].toString().toLowerCase().includes(search)
  } catch(e) {
    return false
  }
}

const filterSpecificColumn = (searchSplit: string[], headerNames: string[]): boolean => {
  return searchSplit.length > 1 && headerNames.includes(searchSplit[0])
}
