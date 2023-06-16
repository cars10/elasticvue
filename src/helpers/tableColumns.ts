interface ColumnOptions {
  label: string,
  field?: string,
  align?: string
}

export const genColumns = (options: ColumnOptions[]): any[] => {
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