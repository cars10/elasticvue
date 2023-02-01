import { ref } from 'vue'
import { openDB } from 'idb'
import { INDEXEDDB_NAME } from '@/consts'

const indexedDbConnections = {}

class Connection {
  constructor (tableName) {
    this.tableName = tableName
    this.db = null
    this.store = null
    this.loading = ref(false)
    this.entries = ref([])
  }

  initialize () {
    return openDB(INDEXEDDB_NAME, 1, {
      upgrade: db => {
        const store = db.createObjectStore(this.tableName, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('date', 'date')
        store.createIndex('favorite', 'favorite')
      }
    }).then(database => {
      this.db = database
      this.dbReload()
    })
  }

  dbInsert (obj) {
    this.db.add(this.tableName, obj)
    this.dbReload()
  }

  dbUpdate (obj) {
    this.db.put(this.tableName, obj)
    this.dbReload()
  }

  dbGetAll () {
    return this.db.getAll(this.tableName)
  }

  dbDelete (id) {
    this.db.delete(this.tableName, id)
    this.dbReload()
  }

  dbClear () {
    this.db.clear(this.tableName).then(() => {
      this.entries.value = []
    })
  }

  async dbClearNonFavorites () {
    const tx = this.db.transaction(this.tableName, 'readwrite')
    const index = tx.store.index('favorite')
    let cursor = await index.openCursor(IDBKeyRange.only(0))
    while (cursor) {
      cursor.delete()
      cursor = await cursor.continue()
    }
    await tx.done
    this.dbReload()
  }

  async importData (data) {
    const tx = this.db.transaction(this.tableName, 'readwrite')
    data.forEach(obj => {
      tx.store.put(obj)
    })
    await tx.done
  }

  dbReload () {
    this.setLoading()
    this.dbGetAll().then(r => {
      this.entries.value = r.reverse()
      this.unsetLoading()
    })
  }

  setLoading () {
    this.loading.value = true
  }

  unsetLoading () {
    this.loading.value = false
  }
}

export const useIdb = tableName => {
  if (!indexedDbConnections[tableName]) indexedDbConnections[tableName] = new Connection(tableName)

  return {
    connection: indexedDbConnections[tableName]
  }
}
