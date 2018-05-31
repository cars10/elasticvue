import { normalizeSearchParams } from '../helpers'
import { REQUEST_DEFAULTS } from '../consts'

export default class ElasticsearchAdapter {
  constructor (client) {
    this.client = client
  }

  /**
   * testAdapter
   * * first tries to ping
   * * then tries to search to test post requests
   * @returns Promise
   */
  async testAdapter () {
    // use async/await here because chaining both methods leads to weird error handling
    try {
      await this.ping()
      await this.search({size: 0})
      return Promise.resolve(true)
    } catch (error) {
      return Promise.reject(error)
    }
  }

  /**
   * Pings to see if the host is available.
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-ping
   */
  ping () {
    return this.client.ping(REQUEST_DEFAULTS)
  }

  /**
   * Get basic cluster information
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-info
   */
  clientInfo () {
    return this.client.info(REQUEST_DEFAULTS)
  }

  /**
   * Get cluster health information
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cluster-health
   */
  clusterHealth () {
    return this.client.cluster.health(REQUEST_DEFAULTS)
  }

  /**
   * Get a list of all indices
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cat-indices
   */
  catIndices () {
    return this.client.cat.indices(REQUEST_DEFAULTS)
  }

  /**
   * Will create a new index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-create
   */
  indicesCreate (params) {
    return this.client.indices.create(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Will delete a specific index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-delete
   */
  indicesDelete (params) {
    return this.client.indices.delete(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Get information about an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-get
   */
  indicesGet (params) {
    return this.client.indices.get(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Find out if an index exists
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-exists
   */
  indicesExists (params) {
    return this.client.indices.exists(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Flush all or specific indices
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-flush
   */
  indicesFlush (params) {
    return this.client.indices.flush(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Set settings
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-flush
   */
  indicesPutSettings (params) {
    return this.client.indices.putSettings(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Get a document
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-get
   * @param params
   */
  get (params) {
    return this.client.get(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /**
   * Search api
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
   * @param searchParams
   */
  search (searchParams) {
    let params = searchParams || {}
    normalizeSearchParams(params)
    return this.client.search(Object.assign({}, REQUEST_DEFAULTS, params))
  }

  /********/

  /**
   * Creates multiple indices, one for each word. Only creates if they do not already exists
   * @param generateWords {function}
   */
  async createIndices (generateWords) {
    let words = generateWords()
    for (let word of [...new Set(words)]) {
      await this.indicesExists({index: word}).then(
        exists => {
          if (!exists) {
            this.indicesCreate({index: word})
          }
        }
      )
    }
  }
}
