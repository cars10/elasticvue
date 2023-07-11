import { ref } from 'vue'
import { Ref } from 'vue'

export const useSelectableRows = (data: any) => {
  const selectedItems: Ref<any[]> = ref([])
  const allItemsSelected: Ref<boolean | null> = ref(false)

  const setIndeterminate = () => {
    if (selectedItems.value.length === data.value.length) {
      allItemsSelected.value = true
    } else if (selectedItems.value.length > 0) {
      allItemsSelected.value = null
    } else {
      allItemsSelected.value = false
    }
  }

  return {
    selectedItems,
    allItemsSelected,
    setIndeterminate
  }
}
