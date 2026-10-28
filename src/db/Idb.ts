import { openDB } from 'idb'
import { DbTable } from './indexeddb.ts'
import { DbSchema } from './types.ts'

const DB_VERSION = 2
const TABLES: { name: keyof DbSchema; indexes: string[]; autoIncrement: boolean }[] = [
  { name: 'restQueryHistory', indexes: ['date'], autoIncrement: true },
  { name: 'restQuerySavedQueries', indexes: [], autoIncrement: true },
  { name: 'restQueryTabs', indexes: [], autoIncrement: true },
  { name: 'restQueryResponses', indexes: [], autoIncrement: false }
]

const databases = new Map<string, DbSchema>()

const openClusterDb = (clusterUuid: string): DbSchema => {
  const connection = openDB(`elasticvue-${clusterUuid}`, DB_VERSION, {
    upgrade(db, _oldVersion, _newVersion, tx) {
      TABLES.forEach(({ name, indexes, autoIncrement }) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id', autoIncrement })

        const store = tx.objectStore(name)
        indexes.forEach((index) => {
          if (!store.indexNames.contains(index)) store.createIndex(index, index)
        })
      })
    },
    blocking() {
      databases.delete(clusterUuid)
      connection.then((db) => db.close())
    }
  })

  return {
    restQueryHistory: new DbTable(connection, 'restQueryHistory'),
    restQuerySavedQueries: new DbTable(connection, 'restQuerySavedQueries'),
    restQueryTabs: new DbTable(connection, 'restQueryTabs'),
    restQueryResponses: new DbTable(connection, 'restQueryResponses')
  }
}

export const clusterDb = (clusterUuid: string): DbSchema => {
  if (!databases.has(clusterUuid)) databases.set(clusterUuid, openClusterDb(clusterUuid))
  return databases.get(clusterUuid)!
}
