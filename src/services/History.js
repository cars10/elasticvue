import { openDB } from 'idb'

export const useDb = (dbName, tableName) => {
  const loadDb = () => {
    return openDB(dbName, 1, {
      upgrade (db) {
        db.createObjectStore(tableName, {
          keyPath: 'id',
          autoIncrement: true
        })
      }
    })
  }

  const dbInsert = (db, obj) => {
    db.add(tableName, obj)
  }

  const dbGetAll = db => {
    return db.getAll(tableName)
  }

  const dbTableClear = db => {
    return db.deleteObjectStore(tableName)
  }

  const dbDelete = (db, id) => {
    db.delete(tableName, id)
  }

  return {
    loadDb,
    dbInsert,
    dbGetAll,
    dbTableClear,
    dbDelete
  }
}
