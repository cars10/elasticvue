import { IDBPDatabase } from 'idb'

export class DbTable<T extends { id?: number }> {
  constructor(
    private readonly db: Promise<IDBPDatabase>,
    private readonly name: string
  ) {}

  async getAll(): Promise<T[]> {
    return (await this.db).getAll(this.name)
  }

  async insert(obj: T): Promise<number> {
    return (await (await this.db).add(this.name, obj)) as number
  }

  async update(obj: T) {
    await (await this.db).put(this.name, obj)
  }

  async remove(id?: number) {
    if (id === undefined) return
    await (await this.db).delete(this.name, id)
  }

  async bulkInsert(data: T[]) {
    const tx = (await this.db).transaction(this.name, 'readwrite')
    data.forEach((obj) => tx.store.put(obj))
    await tx.done
  }

  async clear() {
    await (await this.db).clear(this.name)
  }
}
