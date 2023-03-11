import { useConnectionStore } from '../store/connection'
import { IdbAdapter } from '../models/indexeddb'

const tables = [
  { name: 'restQueryHistory', indexes: ['date'] },
  { name: 'restQueryTabs', indexes: [] },
  { name: 'restQuerySavedQueries', indexes: [] },
]
const dbVersion = 5

const databaseName = clusterUuid => {
  return `elasticvue-${clusterUuid}`
}

let db = null
export const useIdb = () => {
  if (!db) {
    const connectionStore = useConnectionStore()
    const clusterUuid = connectionStore.activeCluster.clusterUuid
    db = new IdbAdapter({ database: databaseName(clusterUuid), version: dbVersion, tables })
  }
  return db
}

export const useIdbStore = tableNames => {
  const handle = useIdb()
  const stores = {}

  if (!Array.isArray(tableNames)) tableNames = [tableNames]
  tableNames.forEach(tableName => {
    stores[tableName] = handle.stores[tableName]
  })

  return stores
}

export const specificIdb = clusterUuid => {
  return new IdbAdapter({ database: databaseName(clusterUuid), version: dbVersion, tables })
}