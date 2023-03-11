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
    this._tables.forEach(table => {
      this.stores[table.name] = new IdbStoreAdapter(table.name, this)
    })
  }

  async connect () {
    if (this._idb) return
    if (!this.connectPromise) this.connectPromise = this._openIdb()

    await this.connectPromise
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

class IdbStoreAdapter {
  constructor (tableName, adapter) {
    this.tableName = tableName
    this._adapter = adapter
  }

  async getAll () {
    await this._adapter.connect()
    return this._adapter._idb.getAll(this.tableName)
  }

  async reload () {
    await this._adapter.connect()
    return this._adapter._idb.getAll(this.tableName)
  }

  async insert (obj) {
    await this._adapter.connect()
    return this._adapter._idb.add(this.tableName, obj)
  }

  async update (obj) {
    await this._adapter.connect()
    return this._adapter._idb.put(this.tableName, obj)
  }

  async remove (id) {
    await this._adapter.connect()
    return this._adapter._idb.delete(this.tableName, id)
  }

  async clear () {
    await this._adapter.connect()
    return this._adapter._idb.clear(this.tableName)
  }

  async bulkInsert (data) {
    await this._adapter.connect()
    const tx = this._adapter._idb.transaction(this.tableName, 'readwrite')
    data.forEach(obj => (tx.store.put(obj)))
    return tx.done
  }
}
