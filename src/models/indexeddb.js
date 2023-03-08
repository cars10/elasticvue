import { openDB } from 'idb'

export class IdbAdapter {
  constructor ({ database, version, tables }) {
    this._database = database
    this._version = version
    this._tables = tables
    this._idb = null
    this.stores = {}
    this._setup()
  }

  _setup () {
    this._tables.forEach(table => (this._buildTable(table.name)))
  }

  async connect () {
    if (this._idb) return
    if (!this.connectPromise) this.connectPromise = this._openIdb()

    await this.connectPromise
  }

  _buildTable (tableName) {
    this.stores[tableName] = {
      getAll: async () => {
        await this.connect()
        return this._idb.getAll(tableName)
      },
      insert: async obj => {
        await this.connect()
        return this._idb.add(tableName, obj)
      },
      update: async obj => {
        await this.connect()
        return this._idb.put(tableName, obj)
      },
      remove: async key => {
        await this.connect()
        return this._idb.delete(tableName, key)
      },
      clear: async () => {
        await this.connect()
        return this._idb.clear(tableName)
      },
      bulkInsert: async data => {
        const tx = this._idb.transaction(tableName, 'readwrite')
        data.forEach(obj => (tx.store.put(obj)))
        return tx.done
      }
    }
  }

  async _openIdb () {
    if (this._idb) return

    this._idb = await openDB(this._database, this._version, {
      upgrade: (db, _oldVersion, _newVersion, tx) => {
        this._tables.forEach(table => {
          if (!db.objectStoreNames.contains(table.name)) {
            db.createObjectStore(table.name, {
              keyPath: 'id',
              autoIncrement: true,
            })
          }

          const store = tx.objectStore(table.name)
          table.indexes.forEach(index => {
            if (!store.indexNames.contains(index)) {
              store.createIndex(index, index)
            }
          })
        })
      },
    })
  }
}
