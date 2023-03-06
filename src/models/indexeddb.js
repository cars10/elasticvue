import { openDB } from 'idb'
import { ref } from 'vue'

export class IdbConnection {
  constructor (databaseName, tables) {
    this.databaseName = databaseName
    this.db = null

    this.tables = {}
    this.indexes = {}
    tables.forEach((table) => {
      this.tables[table.name] = buildTable(table.name, this)
      this.indexes[table.name] = table.indexes
    })
  }

  async setup (version = 1) {
    this.db = await openDB(this.databaseName, version, {
      upgrade: (db, _oldVersion, _newVersion, tx) => {
        Object.keys(this.tables).forEach(tableName => {
          if (!db.objectStoreNames.contains(tableName)) {
            db.createObjectStore(tableName, {
              keyPath: 'id',
              autoIncrement: true,
            })
          }

          const store = tx.objectStore(tableName)
          const indexes = this.indexes[tableName]
          indexes.forEach(index => {
            if (!store.indexNames.contains(index)) {
              store.createIndex(index, index)
            }
          })
        })
      },
    })

    return this
  }

  reloadAllTables () {
    Object.keys(this.tables).forEach(tableName => {
      this.tables[tableName].reloadElements()
    })
  }
}

const buildTable = (name, connection) => {
  const elements = ref([])

  const getAll = () => (connection.db.getAll(name))
  const reloadElements = () => {
    console.log('reloadTables')
    return getAll().then(r => (elements.value = r))
  }

  const insert = obj => {
    return connection.db.add(name, obj).then(reloadElements)
  }

  const update = (obj) => {
    return connection.db.put(name, obj).then(reloadElements)
  }

  const updateKey = (obj, key) => {
    return connection.db.put(name, obj, key).then(reloadElements)
  }

  const remove = (key) => {
    return connection.db.delete(name, key).then(reloadElements)
  }

  const clear = () => {
    return connection.db.clear(name).then(() => (elements.value = []))
  }

  const insertMultiple = data => {
    const tx = connection.db.transaction(name, 'readwrite')
    data.forEach(obj => (tx.store.put(obj)))
    return tx.done
  }

  return {
    elements,
    insert,
    update,
    updateKey,
    remove,
    clear,
    insertMultiple,
    getAll,
    reloadElements
  }
}
