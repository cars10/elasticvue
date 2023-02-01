import { ref } from 'vue'

export const useSelectableRows = data => {
  const selectedItems = ref([])
  const allItemsSelected = ref(false)

  const setIndeterminate = () => {
    if (selectedItems.value.length === data.value.length) {
      allItemsSelected.value = true
    } else if (selectedItems.value.length > 0) {
      allItemsSelected.value = null
    } else {
      allItemsSelected.value = false
    }
  }
  const checkAll = val => {
    if (val) {
      selectedItems.value = data.value.map(i => i.index)
    } else {
      selectedItems.value = []
    }
  }

  return {
    selectedItems,
    allItemsSelected,
    setIndeterminate,
    checkAll
  }
}
