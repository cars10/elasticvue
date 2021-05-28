import store from '@/store'
import { ref, watch } from '@vue/composition-api'

export const exportStoreDataUri = () => {
  const currentState = JSON.parse(JSON.stringify(store.state)) // use JSON.parse&stringify for deep copy
  delete currentState.connection.elasticsearchAdapter

  return `data:application/json,${encodeURIComponent(JSON.stringify(currentState))}`
}

export const useImportFileData = fileInputData => {
  const valid = ref(false)
  const errorMessage = ref('')
  const importedData = ref(null)

  watch(fileInputData, newValue => {
    if (newValue) {
      handleFileUpload(newValue)
    } else {
      valid.value = false
      errorMessage.value = ''
    }
  })

  const handleFileUpload = fileData => {
    importedData.value = null
    loadFileDataContent(fileData)
      .then(content => {
        validateContent(content)
        if (valid.value) importedData.value = content
      })
      .catch(() => {
        valid.value = false
        errorMessage.value = 'Unknown error'
      })
  }

  const validateContent = result => {
    try {
      JSON.parse(result)
      valid.value = true
      errorMessage.value = ''
    } catch (e) {
      valid.value = false
      errorMessage.value = 'Error: Invalid JSON'
    }
  }

  return {
    valid,
    errorMessage,
    importedData
  }
}

const loadFileDataContent = fileData => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsText(fileData)
  })
}
