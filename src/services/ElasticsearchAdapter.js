import { normalizeSearchParams, paramsWithDefaults } from '../helpers'
import { REQUEST_DEFAULT_BODY } from '../consts'

export default class ElasticsearchAdapter {
  constructor (client) {
    this.client = client
  }

  /**
   * Pings to see if the host is available.
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-ping
   */
  ping () {
    return this.client.ping(REQUEST_DEFAULT_BODY)
  }

  /**
   * Bulk index data
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-bulk
   */
  bulk (params) {
    return this.client.bulk(paramsWithDefaults(params))
  }

  /**
   * Get basic cluster information
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-info
   */
  clientInfo () {
    return this.client.info(REQUEST_DEFAULT_BODY)
  }

  /**
   * Get cluster health information
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cluster-health
   */
  clusterHealth () {
    return this.client.cluster.health(REQUEST_DEFAULT_BODY)
  }

  /**
   * Get a list of all indices
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cat-indices
   */
  catIndices () {
    return this.client.cat.indices(REQUEST_DEFAULT_BODY)
  }

  /**
   * Will create a new index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-create
   */
  indicesCreate (params) {
    return this.client.indices.create(paramsWithDefaults(params))
  }

  /**
   * Will delete a specific index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-delete
   */
  indicesDelete (params) {
    return this.client.indices.delete(paramsWithDefaults(params))
  }

  /**
   * Get information about an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-get
   */
  indicesGet (params) {
    return this.client.indices.get(paramsWithDefaults(params))
  }

  /**
   * Get stats for an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-stats
   */
  indicesStats (params) {
    return this.client.indices.stats(paramsWithDefaults(params))
  }

  /**
   * Close an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-close
   */
  indicesClose (params) {
    return this.client.indices.close(paramsWithDefaults(params))
  }

  /**
   * Open an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-open
   */
  indicesOpen (params) {
    return this.client.indices.open(paramsWithDefaults(params))
  }

  /**
   * Force merge for an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-forcemerge
   */
  indicesForcemerge (params) {
    return this.client.indices.forcemerge(paramsWithDefaults(params))
  }

  /**
   * Refresh an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-refresh
   */
  indicesRefresh (params) {
    return this.client.indices.refresh(paramsWithDefaults(params))
  }

  /**
   * Clear index cache
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-clearcache
   */
  indicesClearCache (params) {
    return this.client.indices.clearCache(paramsWithDefaults(params))
  }

  /**
   * Find out if an index exists
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-exists
   */
  indicesExists (params) {
    return this.client.indices.exists(paramsWithDefaults(params))
  }

  /**
   * Flush all or specific indices
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-flush
   */
  indicesFlush (params) {
    return this.client.indices.flush(paramsWithDefaults(params))
  }

  /**
   * Set settings
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-flush
   */
  indicesPutSettings (params) {
    return this.client.indices.putSettings(paramsWithDefaults(params))
  }

  /**
   * Cat nodes
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cat-nodes
   */
  catNodes (params) {
    return this.client.cat.nodes(paramsWithDefaults(params))
  }

  /**
   * Get a document
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-get
   * @param params
   */
  get (params) {
    return this.client.get(paramsWithDefaults(params))
  }

  /**
   * Delete a document
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-delete
   * @param params {Object} { index, type, id }
   */
  delete (params) {
    return this.client.delete(paramsWithDefaults(params))
  }

  /**
   * Search api
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
   * @param searchParams
   */
  search (searchParams) {
    let params = normalizeSearchParams(searchParams)
    return this.client.search(paramsWithDefaults(params))
  }

  /**
   * Get all snapshot repositories
   * @returns {*}
   */
  catRepositories () {
    return this.snapshotGetRepository({ repository: '*' })
  }

  /**
   * Create a snapshot repository
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-snapshot-createrepository
   * @param params
   */
  snapshotCreateRepository (params) {
    return this.client.snapshot.createRepository(paramsWithDefaults(params))
  }

  /**
   * Create a snapshot
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-snapshot-create
   * @param params
   */
  snapshotCreate (params) {
    return this.client.snapshot.create(paramsWithDefaults(params))
  }

  /**
   * Cat snapshots in repository
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cat-snapshots
   * @param params
   */
  catSnapshots (params) {
    return this.client.cat.snapshots(paramsWithDefaults(params))
  }

  /********/

  /**
   * Creates multiple indices, one for each word. Only creates if they do not already exists
   * @param words {Array}
   */
  async createIndices (words) {
    for (let word of [...new Set(words)]) {
      await this.indicesExists({ index: word })
        .then(exists => {
          if (!exists) {
            this.indicesCreate({ index: word })
          }
        })
    }
  }
}
