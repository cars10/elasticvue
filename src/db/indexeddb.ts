import { IDBPDatabase, openDB } from 'idb'
import { ref, Ref } from 'vue'
import { DbSchema, TableDefinition } from './types.ts'

type MaybePromise<T> = Promise<T> | null

export class Db {
  dbName: string
  dbVersion: number
  tables: any[]
  models: DbSchema
  connectPromise: MaybePromise<void>
  _idb: IDBPDatabase

  constructor ({ dbName, dbVersion, tables }: { dbName: string, dbVersion: number, tables: TableDefinition[] }) {
    this.dbName = dbName
    this.dbVersion = dbVersion
    this.tables = tables
    this.models = {} as DbSchema
    this.connect()
  }

  async connect () {
    if (this._idb) return
    if (!this.connectPromise) this.connectPromise = this._openIdb()

    await this.connectPromise
    this.connectPromise = null
  }

  async _openIdb () {
    if (this._idb) return

    this._idb = await openDB(this.dbName, this.dbVersion, {
      upgrade: (db, _oldVersion, _newVersion, tx) => {
        this.tables.forEach(table => {
          if (!db.objectStoreNames.contains(table.name)) {
            db.createObjectStore(table.name, {
              keyPath: 'id',
              autoIncrement: true,
            })
          }

          const store = tx.objectStore(table.name)
          table.indexes.forEach((index: string) => {
            if (!store.indexNames.contains(index)) {
              store.createIndex(index, index)
            }
          })
        })
      },
    })
  }
}

export class DbModel<T> {
  tableName: string
  all: Ref<T[]>
  db: Db
  reloadPromise: MaybePromise<T[]>

  constructor (tableName: string, db: Db) {
    this.tableName = tableName
    this.db = db
    this.all = ref([])
  }

  last () {
    return this.all.value[this.all.value.length - 1]
  }

  async reload () {
    await this.db.connect()

    if (!this.reloadPromise) this.reloadPromise = this.db._idb.getAll(this.tableName)
    this.all.value = await this.reloadPromise

    this.reloadPromise = null
  }

  async insert (obj: T) {
    await this.db.connect()
    const id = await this.db._idb.add(this.tableName, obj)
    await this.reload()
    return id
  }

  async update (obj: T) {
    await this.db.connect()
    const id = await this.db._idb.put(this.tableName, obj)
    await this.reload()
    return id
  }

  async remove (id?: number) {
    if (!id) return
    await this.db.connect()
    await this.db._idb.delete(this.tableName, id)
    await this.reload()
  }

  async bulkInsert (data: T[]) {
    await this.db.connect()
    const tx = this.db._idb.transaction(this.tableName, 'readwrite')
    if (!tx) return
    data.forEach(obj => (tx.store.put(obj)))
    return tx.done
  }

  async getAll () {
    await this.db.connect()
    return this.db._idb.getAll(this.tableName)
  }

  async clear () {
    await this.db.connect()
    return this.db._idb?.clear(this.tableName)
  }
}
