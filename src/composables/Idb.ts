import { useConnectionStore } from '../store/connection'
import { IdbAdapter } from '../models/indexeddb'

const tables = [
  { name: 'restQueryHistory', indexes: ['date'] },
  { name: 'restQueryTabs', indexes: [] },
  { name: 'restQuerySavedQueries', indexes: [] },
]
const dbVersion = 1

const databaseName = (clusterUuid?: string) => (`elasticvue-${clusterUuid}`)

let db: IdbAdapter | null = null
export const useIdb = () => {
  if (!db) {
    const connectionStore = useConnectionStore()
    const clusterUuid = connectionStore.activeCluster?.uuid
    db = new IdbAdapter({ database: databaseName(clusterUuid), version: dbVersion, tables })
  }
  return db
}

export const useIdbStore = (tableNames: string[]) => {
  const handle = useIdb()
  const stores: any = {}

  if (!Array.isArray(tableNames)) tableNames = [tableNames]
  tableNames.forEach(tableName => {
    stores[tableName] = handle.stores[tableName]
  })

  return stores
}

export const specificIdb = (clusterUuid: string) => {
  return new IdbAdapter({ database: databaseName(clusterUuid), version: dbVersion, tables })
}