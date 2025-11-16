import { QTableProps } from 'quasar'

export type PaginationStorePartial = {
  pagination: QTableProps['pagination']
}

export type ReloadIntervalStorePartial = {
  reloadInterval: number | null
}

export const paginationStoreDefaultProps = (sortBy: string = '', descending: boolean = false, rowsPerPage: number = 10) => ({
  sortBy,
  descending,
  rowsPerPage
})

export const persistPaginationProps = () => ['pagination.sortBy', 'pagination.descending', 'pagination.rowsPerPage']
export const persistReloadIntervalProps = () => ['reloadInterval']
