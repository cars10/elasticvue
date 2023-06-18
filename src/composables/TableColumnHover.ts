import { Ref, ref } from 'vue'

export const useTableColumnHover = () => {
  const markedColumnIndex: Ref<number | null> = ref(null)
  const markColumn = (i: number) => {
    if (markedColumnIndex.value !== i) markedColumnIndex.value = i
  }
  const unmarkColumn = () => (markedColumnIndex.value = null)

  return {
    markedColumnIndex,
    markColumn,
    unmarkColumn
  }
}