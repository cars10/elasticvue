import { Ref, ref } from 'vue'
import { askConfirm } from '../helpers/dialogs'
import { useTranslation } from './i18n'
import { useConnectionStore } from '../store/connection'
import { initDb } from '../db/Idb.ts'

type Backup = {
  version: string,
  store: StoreBackup,
  idb: IdbBackup
}

type StoreBackup = Record<string, object>
type IdbBackup = Record<string, IdbClusterBackup>
type IdbClusterBackup = Record<string, any>

export const useImportExport = ({ confirmImport } = { confirmImport: false }) => {
  const t = useTranslation()
  const storeAsJson = () => {
    const storesToBackup = ['codeEditor', 'connection', 'i18n', 'indices', 'resize', 'restQuery', 'theme']
    const backup: StoreBackup = {}

    storesToBackup.forEach(store => {
      const rawValue = localStorage.getItem(store)
      if (rawValue) backup[store] = JSON.parse(rawValue)
    })

    return JSON.parse(JSON.stringify(backup))
  }

  const idbAsJson = async () => {
    const connectionStore = useConnectionStore()
    const backup: IdbBackup = {}

    for await (const cluster of connectionStore.clusters) {
      const db = initDb(cluster.uuid)
      backup[cluster.uuid] = {}

      for (const [tableName, model] of Object.entries(db.models)) {
        backup[cluster.uuid][tableName] = await model.getAll()
      }
    }

    return backup
  }

  const backupJsonString = async () => {
    const backup: Backup = {
      version: __APP_VERSION__,
      store: storeAsJson(),
      idb: await idbAsJson()
    }

    return JSON.stringify(backup)
  }

  const importFile: Ref<File | null> = ref(null)
  const importBackup = async () => {
    if (!importFile.value) return

    if (importFile.value.type !== 'application/json' && !importFile.value.name.endsWith('.json')) {
      return Promise.reject('Wrong file type.')
    }

    try {
      if (confirmImport) {
        const confirm = await askConfirm(t('helpers.import_export.import_backup.confirm'))
        if (!confirm) return Promise.resolve(false)
      }

      const rawData = await loadFileDataContent(importFile.value)
      if (typeof rawData !== 'string') return Promise.reject('Invalid backup')

      const backup = JSON.parse(rawData)
      if (!backup.store) return Promise.reject('Invalid backup')

      // pinia store
      localStorage.clear()
      Object.entries(backup.store).forEach(([name, value]) => {
        localStorage.setItem(name, JSON.stringify(value))
      })

      // idb
      for (const uuid of Object.keys(backup.idb)) {
        const db = initDb(uuid)

        for (const [tableName, model] of Object.entries(db.models)) {
          await model.clear()
          await model.bulkInsert(backup.idb[uuid][tableName])
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

const loadFileDataContent = (file: File): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(reader.result)
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}
