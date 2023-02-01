import store from '@/store'
import { ref, watch } from 'vue'
import { useIdb } from '@/services/IdbConnection'
import { IDB_TABLE_NAMES, LOCALSTORAGE_KEY } from '@/consts'
import i18n from '@/i18n'
import { stringifyJsonBigInt } from '@/helpers/json_parse'
import { askConfirm } from '@/services/tauri/dialogs'

export const exportStoreDataUri = async () => {
  const currentState = JSON.parse(JSON.stringify(store.state)) // use JSON.parse&stringify for deep copy
  delete currentState.connection.elasticsearchAdapter

  const { connection } = useIdb(IDB_TABLE_NAMES.REST)
  await connection.initialize()
  currentState.idb = {}
  currentState.idb[IDB_TABLE_NAMES.REST] = connection.entries.value

  return stringifyJsonBigInt(currentState)
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

  const importBackup = async () => {
    if (!valid.value || !importedData.value) return

    askConfirm(i18n.t('helpers.import_export.import_backup.confirm')).then(async confirmed => {
      if (confirmed) {
        const json = JSON.parse(importedData.value)
        const idbData = Object.assign({}, json.idb)
        delete json.idb

        // import elasticvue settings
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(json))
        // import idb data
        const validTableNames = Object.values(IDB_TABLE_NAMES)
        const tables = Object.keys(idbData)
        for (const table of tables) {
          if (!validTableNames.includes(table)) continue
          const { connection } = useIdb(table)
          await connection.initialize()
          await connection.importData(idbData[table])
        }

        return true
      } else {
        return false
      }
    })
  }

  return {
    valid,
    errorMessage,
    importedData,
    importBackup
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
