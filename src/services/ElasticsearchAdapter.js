import { normalizeSearchParams } from '@/helpers'

export default class ElasticsearchAdapter {
  constructor (client) {
    this.client = client
  }

  ping () {
    return this.client.ping()
  }

  bulk (params) {
    return this.client.bulk(params)
  }

  clientInfo () {
    return this.client.clusterInfo()
  }

  clusterHealth () {
    return this.client.clusterHealth()
  }

  clusterSettings () {
    return this.client.clusterSettings()
  }

  catIndices (params) {
    return this.client.catIndices(params)
  }

  indexGetAlias (params) {
    return this.client.indexGetAlias(params)
  }

  indexCreate (params) {
    return this.client.indexCreate(params)
  }

  indexDelete (params) {
    return this.client.indexDelete(params)
  }

  indexGet (params) {
    return this.client.indexGet(params)
  }

  indexStats (params) {
    return this.client.indexStats(params)
  }

  indexClose (params) {
    return this.client.indexClose(params)
  }

  indexOpen (params) {
    return this.client.indexOpen(params)
  }

  indexForcemerge (params) {
    return this.client.indexForcemerge(params)
  }

  indexRefresh (params) {
    return this.client.indexRefresh(params)
  }

  indexClearCache (params) {
    return this.client.indexClearCache(params)
  }

  indexFlush (params) {
    return this.client.indexFlush(params)
  }

  indexExists (params) {
    return this.client.indexExists(params)
  }

  indexPutSettings (params) {
    return this.client.indexPutSettings(params)
  }

  catNodes (params) {
    return this.client.catNodes(params)
  }

  get (params) {
    return this.client.get(params)
  }

  search (searchParams) {
    let params = normalizeSearchParams(searchParams)
    return this.client.search(params)
  }

  catRepositories (params) {
    return this.client.catRepositories(params)
  }

  catSnapshots (params) {
    return this.client.catSnapshots(params)
  }

  snapshotCreateRepository (params) {
    return this.client.snapshotCreateRepository(params)
  }

  snapshotDeleteRepository (params) {
    return this.client.snapshotDeleteRepository(params)
  }

  snapshotCreate (params) {
    return this.client.snapshotCreate(params)
  }

  snapshotDelete (params) {
    return this.client.snapshotDelete(params)
  }

  snapshotRestore (params) {
    return this.client.snapshotRestore(params)
  }

  getSnapshot (params) {
    return this.client.getSnapshot(params)
  }

  getSnapshotIndices (params) {
    return this.client.getSnapshot(params)
      .then(body => Promise.resolve(body.snapshots[0].indices))
  }

  async test () {
    try {
      await this.ping()
      await this.search({ size: 0 })
    } catch (e) {
      return Promise.reject(e)
    }
  }

  /********/

  /**
   * Creates multiple indices, one for each word. Only creates if they do not already exists
   * @param names {Array}
   */
  async createIndices (names) {
    for (let name of [...new Set(names)]) {
      const exists = await this.indexExists({ index: name })
      if (!exists) await this.indexCreate({ index: name })
    }
  }
}
