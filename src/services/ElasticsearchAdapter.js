import { normalizeSearchParams } from '../helpers'

export default class ElasticsearchAdapter {
  client

  /**
   * Defaults used in each request
   * @type {{requestTimeout: number, format: string}}
   */
  requestDefaults = {
    requestTimeout: 3000,
    format: 'json'
  }

  constructor (client) {
    if (client === undefined || client === null) {
      console.error('Client must not be null')
    } else {
      this.client = client
    }
  }

  /**
   * Pings to see if the host is available.
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-ping
   */
  ping () {
    return this.client.ping(this.requestDefaults)
  }

  /**
   * Get basic cluster information
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-info
   */
  getClientInfo () {
    return this.client.info(this.requestDefaults)
  }

  /**
   * Get cluster health information
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cluster-health
   */
  getClusterHealth () {
    return this.client.cluster.health(this.requestDefaults)
  }

  /**
   * Get a list of all indices
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-cat-indices
   */
  getCatIndices () {
    return this.client.cat.indices(this.requestDefaults)
  }

  /**
   * Will create a new index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-create
   */
  indicesCreate (params) {
    return this.client.indices.create(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Will delete a specific index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-delete
   */
  indicesDelete (params) {
    return this.client.indices.delete(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Get information about an index
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-get
   */
  indicesGet (params) {
    return this.client.indices.get(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Find out if an index exists
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-exists
   */
  indicesExists (params) {
    return this.client.indices.exists(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Flush all or specific indices
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-flush
   */
  indicesFlush (params) {
    return this.client.indices.flush(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Set settings
   * @param params
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-indices-flush
   */
  indicesPutSettings (params) {
    return this.client.indices.putSettings(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Get a document
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-get
   * @param params
   */
  get (params) {
    return this.client.get(Object.assign({}, this.requestDefaults, params))
  }

  /**
   * Search api
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
   * @param params
   */
  search (params) {
    normalizeSearchParams(params)
    return this.client.search(Object.assign({}, this.requestDefaults, params))
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
