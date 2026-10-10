import { useConnectionStore } from '../store/connection.ts'
import { Db, DbModel } from './indexeddb.ts'
import { DbSchema, IdbRestQueryHistory, IdbRestQuerySavedQuery, IdbRestQueryTab } from './types.ts'

const dbDefinition = {
  dbVersion: 1,
  tables: [
    { name: 'restQueryHistory', indexes: ['date'] },
    { name: 'restQuerySavedQueries', indexes: [] },
    { name: 'restQueryTabs', indexes: [] }
  ]
}

const databaseName = (clusterUuid: string) => `elasticvue-${clusterUuid}`

let db: Db | undefined

export const useIdb = (): Db | undefined => {
  const clusterUuid = useConnectionStore().activeCluster?.uuid
  if (!clusterUuid) return undefined

  if (!db || db.dbName !== databaseName(clusterUuid)) {
    initDb(clusterUuid)
  }

  return db
}

export const initDb = (clusterUuid: string) => {
  db = new Db({ dbName: databaseName(clusterUuid), ...dbDefinition })
  db.connect()
  db.models.restQueryHistory = new DbModel<IdbRestQueryHistory>('restQueryHistory', db)
  db.models.restQuerySavedQueries = new DbModel<IdbRestQuerySavedQuery>('restQuerySavedQueries', db)
  db.models.restQueryTabs = new DbModel<IdbRestQueryTab>('restQueryTabs', db)

  return db
}

export const useIdbStore = (): DbSchema => {
  const idb = useIdb()
  if (!idb) throw new Error('Cluster IndexedDB unavailable: active cluster has no uuid')
  return idb.models
}
