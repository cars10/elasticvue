export const buildQueryFromTableOptions = (pagination: any) => {
  if (!pagination) return {}

  const from = (pagination.page - 1) * pagination.rowsPerPage
  const size = pagination.rowsPerPage
  const newQueryParts = { size, from, sort: [] }

  const order = pagination.descending ? 'desc' : 'asc'
  const sort: string = pagination.sortBy

  if (sort && order) {
    const sortOptions = {}
    // @ts-expect-error any
    sortOptions[sort] = { order }
    // @ts-expect-error never type
    newQueryParts.sort = [sortOptions]
  }

  return newQueryParts
}

function tableSortMatchesQuerySort(tableSort: unknown, querySort: unknown): boolean {
  if (!Array.isArray(tableSort) || tableSort.length !== 1) return false
  if (!Array.isArray(querySort) || querySort.length < 1) return false
  return JSON.stringify(tableSort[0]) === JSON.stringify(querySort[0])
}

function sortClauseTopLevelFieldCount(sortClause: unknown): number {
  if (!sortClause || typeof sortClause !== 'object' || Array.isArray(sortClause)) return 0
  return Object.keys(sortClause as Record<string, unknown>).length
}

function firstSortClauseField(sortClause: unknown): string | undefined {
  if (!sortClause || typeof sortClause !== 'object' || Array.isArray(sortClause)) return undefined
  const keys = Object.keys(sortClause as Record<string, unknown>)
  return keys[0]
}

export const getTableOptionsToApply = (
  query: Record<string, unknown>,
  tableOptions: Record<string, unknown>,
  pagination: { sortBy?: string }
): Record<string, unknown> => {
  const querySort = query['sort']

  if (querySort != null && typeof querySort === 'object' && !Array.isArray(querySort)) {
    return onlyFromAndSize(tableOptions)
  }

  const querySortArray = Array.isArray(querySort) ? querySort : null
  const firstClause = querySortArray && querySortArray.length > 0 ? querySortArray[0] : undefined
  const firstClauseFieldCount = sortClauseTopLevelFieldCount(firstClause)
  const hasMultiSort = Boolean(
    querySortArray && (querySortArray.length > 1 || (querySortArray.length === 1 && firstClauseFieldCount !== 1))
  )
  const hasSingleSort = Boolean(querySortArray && querySortArray.length === 1 && firstClauseFieldCount === 1)
  const tableHasSort = Boolean(pagination.sortBy)
  const tableMatchesQuery = hasSingleSort && tableHasSort && tableSortMatchesQuerySort(tableOptions.sort, querySort)
  const tableSameFieldAsQuery =
    tableHasSort && hasSingleSort && firstSortClauseField((querySort as unknown[])[0]) === pagination.sortBy

  if (hasMultiSort) return onlyFromAndSize(tableOptions)
  if (hasSingleSort && !tableMatchesQuery && !tableSameFieldAsQuery) return onlyFromAndSize(tableOptions)
  return tableOptions
}

function onlyFromAndSize(tableOptions: Record<string, unknown>): Record<string, unknown> {
  return {
    size: (tableOptions as { size?: number }).size,
    from: (tableOptions as { from?: number }).from
  }
}
