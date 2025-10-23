import { DEFAULT_SORTABLE_COLUMNS, DEFAULT_SORTABLE_COLUMNS_NEW } from '../consts'
import { useConnectionStore } from '../store/connection'

const SORTABLE_TYPES = ['long', 'integer', 'double', 'float', 'date', 'boolean', 'keyword']

export function sortableField (fieldName: string, property: any) {
  let defSortColumn = []
  const connectionStore = useConnectionStore()
  
  if (connectionStore.activeCluster?.majorVersion.split('.')[0] !== undefined
       && +connectionStore.activeCluster?.majorVersion.split('.')[0] < 7)
    defSortColumn = DEFAULT_SORTABLE_COLUMNS
  else
    defSortColumn = DEFAULT_SORTABLE_COLUMNS_NEW  

  if (defSortColumn.includes(fieldName)) return fieldName

  if (property) {
    if (SORTABLE_TYPES.includes(property.type)) {
      return fieldName
    } else if (property.fields) {
      if (property.fields.keyword) {
        return `${fieldName}.keyword`
      } else {
        const subFields = Object.keys(property.fields)

        for (let i = 0; i < subFields.length; i++) {
          const subField = subFields[i]
          if (SORTABLE_TYPES.includes(property.fields[subField].type)) return `${fieldName}.${subField}`
        }
      }
    }
  }
  return null
}
