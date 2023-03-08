import { ref } from 'vue'
import { askConfirm } from '../helpers/dialogs'
import { useTranslation } from './i18n'
import { useConnectionStore } from '../store/connection'

export const useImportExport = ({ confirmImport } = {}) => {
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

  const idbAsJson = async () => {
    const connectionStore = useConnectionStore()
    const backup = {}

    for await (const cluster of connectionStore.clusters) {
      const db = await setupIdb(cluster.clusterUuid)
      backup[cluster.clusterUuid] = {}

      for (const tableName of Object.keys(db.tables)) {
        const table = db.tables[tableName]
        await table.reloadElements()

        backup[cluster.clusterUuid][tableName] = table.elements.value
      }
    }

    return backup
  }

  const backupJsonString = async () => {
    const backup = {
      version: __APP_VERSION__,
      store: storeAsJson(),
      idb: await idbAsJson()
    }

    return JSON.stringify(backup)
  }


  const importFile = ref(null)
  const importBackup = async () => {
    if (importFile.value.type !== 'application/json' && !importFile.value.name.endsWith('.json')) {
      return Promise.reject('Wrong file type.')
    }

    try {
      if (confirmImport) {
        const confirm = await askConfirm(t('helpers.import_export.import_backup.confirm'))
        if (!confirm) return Promise.resolve(false)
      }

      const rawData = await loadFileDataContent(importFile.value)
      const backup = JSON.parse(rawData)
      if (!backup.store) return Promise.reject('Invalid backup')

      // pinia store
      localStorage.clear()
      Object.entries(backup.store).forEach(([name, value]) => {
        localStorage.setItem(name, JSON.stringify(value))
      })

      // idb
      for (const clusterUuid of Object.keys(backup.idb)) {
        const db = await setupIdb(clusterUuid)

        for (const tableName of Object.keys(backup.idb[clusterUuid])) {
          const table = db.tables[tableName]
          await table.insertMultiple(backup.idb[clusterUuid][tableName])
        }
      }

      return Promise.resolve(true)
    } catch (e) {
      console.log(e)
      return Promise.reject('Invalid backup')
    }
  }

  const downloadFileName = `elasticvue_${__APP_VERSION__}_backup.json`

  return {
    downloadFileName,
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
