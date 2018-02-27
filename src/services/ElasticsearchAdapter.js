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

  ping () {
    return this.client.ping(this.requestDefaults)
  }

  getClientInfo () {
    return this.client.info(this.requestDefaults)
  }

  getCatIndices () {
    return this.client.cat.indices(this.requestDefaults)
  }

  search (params) {
    normalizeSearchParams(params)
    return this.client.search(Object.assign(this.requestDefaults, params))
  }

  get (params) {
    return this.client.get(Object.assign(this.requestDefaults, params))
  }
}
