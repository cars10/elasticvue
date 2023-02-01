import { ref } from 'vue'

export const useTableColumnHover = () => {
  const markedColumnIndex = ref(null)
  const markColumn = i => {
    if (markedColumnIndex.value !== i) markedColumnIndex.value = i
  }
  const unmarkColumn = () => (markedColumnIndex.value = null)

  return {
    markedColumnIndex,
    markColumn,
    unmarkColumn
  }
}