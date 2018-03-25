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
   * Get a document
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-get
   * @param params
   */
  get (params) {
    return this.client.get(Object.assign(this.requestDefaults, params))
  }

  /**
   * Search api
   * @see https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search
   * @param params
   */
  search (params) {
    normalizeSearchParams(params)
    return this.client.search(Object.assign(this.requestDefaults, params))
  }
}
