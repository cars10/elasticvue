import { openDB } from 'idb'
import { DbTable } from './indexeddb.ts'
import { DbSchema } from './types.ts'

const DB_VERSION = 3
const TABLES: { name: keyof DbSchema; indexes: string[]; autoIncrement: boolean }[] = [
  { name: 'restQueryHistory', indexes: ['date'], autoIncrement: true },
  { name: 'restQuerySavedQueries', indexes: [], autoIncrement: true },
  { name: 'restQueryTabs', indexes: [], autoIncrement: true },
  { name: 'restQueryResponses', indexes: [], autoIncrement: false },
  { name: 'searchHistory', indexes: ['date'], autoIncrement: true },
  { name: 'savedSearches', indexes: [], autoIncrement: true }
]

const databases = new Map<string, DbSchema>()

const openClusterDb = (clusterId: string): DbSchema => {
  const connection = openDB(`elasticvue-${clusterId}`, DB_VERSION, {
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
      databases.delete(clusterId)
      connection.then((db) => db.close())
    }
  })

  return {
    restQueryHistory: new DbTable(connection, 'restQueryHistory'),
    restQuerySavedQueries: new DbTable(connection, 'restQuerySavedQueries'),
    restQueryTabs: new DbTable(connection, 'restQueryTabs'),
    restQueryResponses: new DbTable(connection, 'restQueryResponses'),
    searchHistory: new DbTable(connection, 'searchHistory'),
    savedSearches: new DbTable(connection, 'savedSearches')
  }
}

export const clusterDb = (clusterId: string): DbSchema => {
  if (!databases.has(clusterId)) databases.set(clusterId, openClusterDb(clusterId))
  return databases.get(clusterId)!
}
