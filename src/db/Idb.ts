import { useConnectionStore } from '../store/connection.ts'
import { Db, DbModel } from './indexeddb.ts'
import { DbSchema, IdbRestQueryHistory, IdbRestQuerySavedQuery, IdbRestQueryTab } from './types.ts'

const dbDefinition = {
  dbVersion: 1,
  tables: [
    { name: 'restQueryHistory', indexes: ['date'] },
    { name: 'restQuerySavedQueries', indexes: [] },
    { name: 'restQueryTabs', indexes: [] },
  ]
}

const databaseName = (clusterUuid?: string) => (`elasticvue${clusterUuid ? '-' + clusterUuid : ''}`)

let db: Db
export const useIdb = () => {
  if (!db) {
    const connectionStore = useConnectionStore()
    const clusterUuid = connectionStore.activeCluster?.uuid
    if (!clusterUuid) return { models: {} as DbSchema }

    db = initDb(clusterUuid)
  }
  return db
}

export const initDb = (clusterUuid?: string) => {
  db = new Db({ dbName: databaseName(clusterUuid), ...dbDefinition })
  db.connect()
  db.models.restQueryHistory = new DbModel<IdbRestQueryHistory>('restQueryHistory', db)
  db.models.restQuerySavedQueries = new DbModel<IdbRestQuerySavedQuery>('restQuerySavedQueries', db)
  db.models.restQueryTabs = new DbModel<IdbRestQueryTab>('restQueryTabs', db)

  return db
}

export const useIdbStore = () => (useIdb()?.models)
export const useOldIdbStore = async () => {
  const instance = new Db({
    dbName: databaseName(), dbVersion: 1, tables: [
      { name: 'rest', indexes: ['date', 'favorite'] }
    ]
  });
  await instance.connect();

  instance.models.restQuerySavedQueries = new DbModel<IdbRestQuerySavedQuery>('rest', instance)
  return instance.models;
}
