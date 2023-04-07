interface ColumnOptions {
  label: string,
  field?: string,
  sortable?: boolean,
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
  return options.map(({ label, field, sortable, align }) => {
    return {
      label,
      field,
      name: field,
      sortable: sortable || false,
      align: align || 'left',
    }
  })
}