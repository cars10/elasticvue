interface ColumnOptions {
  label: string,
  field?: string,
  align?: string
}

interface Column {
  label?: string,
  field?: string,
  name?: string,
  sortable?: boolean,
  align: string
}

export const genColumns = (options: ColumnOptions[]): Column[] => {
  return options.map(({ label, field, align }) => {
    return {
      label,
      field,
      name: field,
      sortable: !!field,
      align: align || 'left',
    }
  })
}