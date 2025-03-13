type ColumnOptions = {
  label: string,
  field?: string,
  align?: string
} | null

export const genColumns = (options: ColumnOptions[]): any[] => {
  return options.filter(c => !!c).map(({ label, field, align }) => {
    return {
      label,
      field,
      name: field,
      sortable: !!field,
      align: align || 'left',
    }
  })
}