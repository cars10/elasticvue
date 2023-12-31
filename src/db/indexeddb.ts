import { IDBPDatabase, openDB } from 'idb'
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
  db: Db

  constructor (tableName: string, db: Db) {
    this.tableName = tableName
    this.db = db
  }

  async last (): Promise<T | null> {
    await this.db.connect()
    const cursor = await this.db._idb.transaction(this.tableName).store.openCursor(null, 'prev')
    return cursor?.value
  }

  async insert (obj: T) {
    await this.db.connect()
    return this.db._idb.add(this.tableName, obj)
  }

  async get (key: IDBValidKey): Promise<T> {
    await this.db.connect()
    return this.db._idb.get(this.tableName, key)
  }

  async update (obj: T) {
    await this.db.connect()
    return this.db._idb.put(this.tableName, obj)
  }

  async remove (id?: number) {
    if (!id) return
    await this.db.connect()
    await this.db._idb.delete(this.tableName, id)
  }

  async bulkInsert (data: T[]) {
    await this.db.connect()
    const tx = this.db._idb.transaction(this.tableName, 'readwrite')
    if (!tx) return
    data.forEach(obj => (tx.store.put(obj)))
    return tx.done
  }

  async getAll (): Promise<T[]> {
    await this.db.connect()
    return this.db._idb.getAll(this.tableName)
  }

  async clear () {
    await this.db.connect()
    return this.db._idb?.clear(this.tableName)
  }
}
