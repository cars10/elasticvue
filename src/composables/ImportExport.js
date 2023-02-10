import { getActivePinia } from 'pinia'
import { ref } from 'vue'
import { askConfirm } from '../helpers/dialogs'
import { useTranslation } from './i18n'

export const useImportExport = () => {
  const t = useTranslation()

  const storeAsJson = () => {
    const storesToBackup = ['codeEditor', 'connection', 'i18n', 'indices', 'resize', 'restQuery', 'theme']
    const backup = {}
    storesToBackup.forEach(store => {
      const rawValue = localStorage.getItem(store)
      if (rawValue) backup[store] = JSON.parse(rawValue)
    })

    return JSON.parse(JSON.stringify(backup))
  }

  const backupJsonString = () => {
    const backup = {
      version: __APP_VERSION__,
      store: storeAsJson()
    }

    //const { connection } = useIdb(IDB_TABLE_NAMES.REST)
    //await connection.initialize()
    //currentState.idb = {}
    //currentState.idb[IDB_TABLE_NAMES.REST] = connection.entries.value

    return JSON.stringify(backup)
  }

  const importFile = ref(null)

  const importBackup = async () => {
    if (importFile.value.type !== 'application/json' && !importFile.value.name.endsWith('.json')) {
      return Promise.reject('wrong file type')
    }

    try {
      const confirm = await askConfirm(t('helpers.import_export.import_backup.confirm'))
      if (!confirm) return

      const rawData = await loadFileDataContent(importFile.value)
      const backup = JSON.parse(rawData)
      localStorage.clear()
      Object.entries(backup.store).forEach(([name, value]) => {
        localStorage.setItem(name, JSON.stringify(value))
      })

      return true
    } catch (e) {
      console.error("nope")
      return false
    }
  }

  return {
    backupJsonString,
    importFile,
    importBackup
  }
}


const loadFileDataContent = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
