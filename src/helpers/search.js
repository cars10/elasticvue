import { parseJsonBigInt, stringifyJsonBigInt } from '@/helpers/json_parse'

export const buildQueryFromTableOptions = (newOptions, oldOptions) => {
  if (!newOptions) return {}
  if (newOptions.page === oldOptions.page &&
    newOptions.itemsPerPage === oldOptions.itemsPerPage &&
    (!oldOptions.sortDesc || newOptions.sortDesc === oldOptions.sortDesc) &&
    newOptions.sortBy === oldOptions.sortBy) {
    return {}
  }

  const from = (newOptions.page - 1) * newOptions.itemsPerPage
  const size = newOptions.itemsPerPage
  const newQueryParts = { size, from }

  let order
  if (Array.isArray(newOptions.sortDesc) && newOptions.sortDesc.length > 0) {
    order = newOptions.sortDesc[0] ? 'desc' : 'asc'
  }

  let sort
  if (Array.isArray(newOptions.sortBy) && newOptions.sortBy.length > 0) {
    sort = newOptions.sortBy[0]
  }

  if (sort && order) {
    const sortOptions = {}
    sortOptions[sort] = { unmapped_type: 'keyword', order: order }
    newQueryParts.sort = [sortOptions]
  } else {
    newQueryParts.sort = []
  }

  return newQueryParts
}

export const mergeSearchQuery = (searchQuery, newQueryParts) => {
  let currentQuery = {}
  try {
    currentQuery = parseJsonBigInt(searchQuery.value)
  } catch (e) {
    return
  }

  const newQuery = Object.assign({}, currentQuery, newQueryParts)
  searchQuery.value = stringifyJsonBigInt(newQuery, null, '\t')
  return true
}
